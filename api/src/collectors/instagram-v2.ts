import { chromium, Browser, Page } from 'playwright';
import { Participante } from './types';
import { ContextoScraping, EstrategiaFn } from './strategies/types';
import {
  IG_APP_ID,
  SESSION_PATH,
  haySesionGuardada,
  aceptarConsentimiento,
  obtenerMediaId,
  obtenerAutorInstagram,
  validarUrlInstagram,
} from './instagram';
import { estrategiaGraphQL } from './strategies/graphql-intercept';
import { estrategiaApiRestInBrowser } from './strategies/api-rest-inbrowser';
import { estrategiaDomScroll } from './strategies/dom-scroll';
import { estrategiaScrollAnonimo } from './strategies/scroll-anon-completo';
import { estrategiaScrollAnonimoGZero } from './strategies/scroll-anon-gzero';
import { estrategiaServicioExterno } from './strategies/external-service';
import { estrategiaScrapFly } from './strategies/scrapfly-external';
import { CuotaAgotadaError } from '../lib/cuota';

const UMBRAL_MINIMO = 0.5;

// Flags de lanzamiento del navegador: reducen memoria/uso de /dev/shm para no
// matar el contenedor de Render (plan free: 512 MB RAM) durante scroll infinito.
// Flags de lanzamiento del navegador: reducen memoria/uso de /dev/shm para no
// matar el contenedor de Render (plan free: 512 MB RAM) durante scroll infinito.
// Módulo 10 (optimización RAM, 2026-08-07): se agregan flags agresivos de ahorro
// (single-process + no-zygote consolidan los ~15 procesos de Chrome en uno solo;
// js-flags acota el heap del renderer; expose-gc permite GC manual) y se baja el
// viewport a 720p (menos tiles/layers que rastrear).
const ARGS_NAVEGADOR = [
  '--disable-blink-features=AutomationControlled',
  '--window-size=1280,720',
  '--disable-dev-shm-usage',
  '--no-sandbox',
  '--disable-gpu',
  '--disable-extensions',
  '--disable-background-networking',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
  '--disable-ipc-flooding-protection',
  // --- Optimización de RAM (Render free 512 MB) ---
  // NOTA (verificado 2026-08-07): `--single-process` CRASHEA Chrome real
  // (la navegación se cae; issue del renderer en proceso único con Playwright).
  // Se conserva `--no-zygote` + `--js-flags` + `--expose-gc` (estables y
  // ahorradores). `--expose-gc` habilita window.gc() para GC manual.
  '--no-zygote',
  '--js-flags=--max-old-space-size=384',
  '--expose-gc',
  '--disable-software-rasterizer',
  '--disable-features=TranslateUI,VizDisplayCompositor',
];

export { validarUrlInstagram };

function deduplicar(participantes: Participante[]): Participante[] {
  const mapa = new Map<string, Participante>();
  for (const p of participantes) {
    const clave = `${p.usuario.toLowerCase()}|${p.comentario}`;
    if (!mapa.has(clave)) mapa.set(clave, p);
  }
  return Array.from(mapa.values());
}

// Obtener la cantidad total de comentarios del HTML del post (SSR)
async function obtenerCantidadComentarios(page: Page): Promise<number | null> {
  try {
    const html = await page.content();
    const match =
      html.match(/"comment_count":\s*(\d+)/) ||
      html.match(/"edge_media_to_parent_comment":\s*\{\s*"count":\s*(\d+)/) ||
      html.match(/"comments":\s*\{\s*"count":\s*(\d+)/);
    if (match) {
      const cantidad = parseInt(match[1]);
      console.log(`Instagram V2: cantidad esperada de comentarios: ${cantidad}`);
      return cantidad;
    }
  } catch {
    /* noop */
  }
  return null;
}

// Orquestador principal con cascada de estrategias:
// A) GraphQL interception → B) API REST in-browser → C) DOM scroll →
// G) Scroll anónimo completo → F) ScrapFly (si SCRAPFLY_TOKEN) →
// D) Apify (si APIFY_TOKEN)
// `opciones.eliminarDuplicados` (default true): filtra pares usuario|comentario
// repetidos (los actores externos pueden devolver comentarios repetidos).
export async function recolectarInstagramV2(
  url: string,
  cantidadMaxima: number = 10000,
  cookieStr: string = '',
  opciones: { eliminarDuplicados?: boolean; paseAprobado?: boolean } = {}
): Promise<Participante[]> {
  const eliminarDuplicados = opciones.eliminarDuplicados !== false;
  let browser: Browser | null = null;

  try {
    const usaSesionGuardada = !cookieStr && haySesionGuardada();
    // La Estrategia G (scroll anónimo completo) REQUIERE Chrome REAL visible
    // (channel:'chrome'): Instagram detecta headless/DevTools/Chromium y corta
    // la carga infinita de comentarios (verificado en vivo 2026-08-05: con
    // sesión headless -> 596 de 2538 esperados; Chrome real visible sin sesión
    // -> 2393/2399). La sesión se puede inyectar igual en Chrome real, por lo
    // que SE usa Chrome visible siempre que sea posible (local), salvo que se
    // provean cookies cookies pegadas (entonces se fuerza headless como
    // respaldo). En la nube hay que verificar Chrome real + xvfb (carpeta 06).
    // Modos de lanzamiento (módulo 10, 2026-08-07):
    //   default   -> Chrome REAL visible (Estrategia G al 99% verificada).
    //   CHROME_MODE=headless  -> Chrome REAL headless (headless nuevo de Chrome,
    //     sin Xvfb en la nube; ahorra el Xvfb pero Chrome igual renderiza páginas,
    //     solo ~7 MB menos que visible en el contenedor).
    //   CHROME_MODE=chromium -> Chromium EMBEBIDO de Playwright headless. Es el
    //     que menos memoria usa del contenedor (5 0-80 MB menos que Chrome real,
    //     no necesita Xvfb), pero Instagram lo detecta MÁS (histórico: capturó
    //     59/2538 vs 2393/2399 del Chrome real visible). Válido para posts CHICOS
    //     (~150-300) donde el observable no pasa; riesgo: corta ~15 en posts
    //     grandes, y sin ser exacto 100%.
    const modoChrome = (process.env.CHROME_MODE || '').toLowerCase();
    const usaLightChromium = modoChrome === 'chromium';
    const fuerzaHeadless = modoChrome === 'headless';
    const headless = !!cookieStr || fuerzaHeadless || usaLightChromium;
    // visible: SIEMPRE Chrome real (channel:'chrome').
    // headless forzado: Chrome real (channel:'chrome') para no aumentar detección.
    // chromium embebido: Sin channel → Playwright busca su Chromium empaquetado;
    //   headless:true. Es el que menos pesa del contenedor 512 MB.
    const launchOptions: { headless: boolean; channel?: string; args?: string[] } = usaLightChromium
      ? { headless: true, args: ARGS_NAVEGADOR }
      : headless
      ? { headless: true, channel: 'chrome', args: ARGS_NAVEGADOR }
      : { headless: false, channel: 'chrome', args: ARGS_NAVEGADOR };
    let channelDisponible = true;
    console.log(
      `Instagram V2: Iniciando scraping de ${url}${cookieStr ? ' (con cookies pegadas)' : usaSesionGuardada ? ` (con sesión guardada)` : ` (sin sesión, ${usaLightChromium ? 'Chromium embebido headless (CHROME_MODE=chromium)' : `Chrome ${headless ? 'headless (CHROME_MODE)' : 'visible'}`})`}`
    );
    try {
      browser = await chromium.launch(launchOptions);
    } catch {
      // Chrome no instalado: fallback a Chromium de Playwright (puede quedar en ~15).
      // Si no hay X server (DISPLAY ausente, típico de la nube), usar headless.
      if (!headless) {
        const hayDisplay = !!process.env.DISPLAY;
        console.log(
          `Instagram V2: Chrome no disponible, usando Chromium de Playwright${hayDisplay ? ' (con X display)' : ' headless (sin X server)'}`
        );
        channelDisponible = false;
        browser = await chromium.launch(
          hayDisplay
            ? { headless: false, args: ARGS_NAVEGADOR }
            : { headless: true, args: ARGS_NAVEGADOR }
        );
      } else {
        throw new Error('No se pudo lanzar el navegador');
      }
    }
    if (!headless && channelDisponible) {
      console.log('Instagram V2: navegador visible (Chrome real) para scroll anónimo completo');
    }
    const context = await browser.newContext(usaSesionGuardada ? { storageState: SESSION_PATH } : {});
    const page = await context.newPage();

    if (cookieStr) {
      try {
        const cookies = cookieStr
          .split(';')
          .map((c) => c.trim())
          .filter(Boolean)
          .map((c) => {
            const i = c.indexOf('=');
            return {
              name: c.slice(0, i).trim(),
              value: c.slice(i + 1).trim(),
              domain: '.instagram.com',
              path: '/',
            };
          })
          .filter((c) => c.name && c.value);
        if (cookies.length > 0) {
          await context.addCookies(cookies);
          console.log(`Instagram V2: ${cookies.length} cookies de sesión aplicadas`);
        }
      } catch (e) {
        console.log('Instagram V2: no se pudieron aplicar las cookies:', (e as Error).message);
      }
    }

    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    });

    await page.goto(url, { waitUntil: 'networkidle', timeout: 40000 });
    await page.waitForTimeout(4000);

    await aceptarConsentimiento(page);

    const autor = await obtenerAutorInstagram(page);
    const shortcode = url.match(/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/)?.[1] || '';
    const mediaId = shortcode ? await obtenerMediaId(page, shortcode) : null;
    const cantidadEsperada = await obtenerCantidadComentarios(page);

    const ctx: ContextoScraping = {
      page,
      url,
      shortcode,
      mediaId,
      autorExcluido: autor,
      cantidadMaxima,
      tieneSesion: !!cookieStr || usaSesionGuardada,
      cantidadEsperada,
      eliminarDuplicados,
      paseAprobado: opciones.paseAprobado,
    };

    console.log(`Instagram V2: esperados ~${cantidadEsperada} comentarios, sesión: ${ctx.tieneSesion ? 'SÍ' : 'no'}`);

    // Sin sesión: G (scroll anónimo) va PRIMERO porque captura todo por sí sola
    // (verificado: 140 únicos) y las estrategias A/B/C la ensucian (clic en
    // "load more", apertura de modal) y marcan la IP ante Instagram.
        // SCRAPER_MODE=gzero (módulo 10, propuesta Gemini 3.6): usa la variante
    // G-Zero (interceptor GraphQL + DOM Wiping + RAM Governor) en vez de la
    // G clásica, para posts grandes en la nube free. La G clásica NO se toca.
    const usarGZero = process.env.SCRAPER_MODE === 'gzero';
    const scrollAnonimo = usarGZero
      ? { nombre: 'Scroll anónimo G-Zero', fn: estrategiaScrollAnonimoGZero }
      : { nombre: 'Scroll anónimo completo', fn: estrategiaScrollAnonimo };
    // Módulo 12 (2026-08-08): G-Zero corrE PRIMERO también con sesión. En la
    // rama sesión iba 4ª (tras GraphQL/API/DOM) llenando la página y dejando
    // el contenedor al límite de RAM; y su contexto anónimo descartaba la
    // sesión. Ahora (con sesión) reutiliza el contexto logueado del
    // orquestador: fue el flujo de la captura 611/1035 verificada.
    const estrategias: { nombre: string; fn: EstrategiaFn }[] = usarGZero
      ? [
          scrollAnonimo,
          { nombre: 'GraphQL interception', fn: estrategiaGraphQL },
          { nombre: 'API REST in-browser', fn: estrategiaApiRestInBrowser },
          { nombre: 'DOM scroll', fn: estrategiaDomScroll },
          { nombre: 'ScrapFly externo', fn: estrategiaScrapFly },
          { nombre: 'Apify externo', fn: estrategiaServicioExterno },
        ]
      : ctx.tieneSesion
        ? [
            { nombre: 'GraphQL interception', fn: estrategiaGraphQL },
            { nombre: 'API REST in-browser', fn: estrategiaApiRestInBrowser },
            { nombre: 'DOM scroll', fn: estrategiaDomScroll },
            scrollAnonimo,
            { nombre: 'ScrapFly externo', fn: estrategiaScrapFly },
            { nombre: 'Apify externo', fn: estrategiaServicioExterno },
          ]
        : [
            scrollAnonimo,
            { nombre: 'GraphQL interception', fn: estrategiaGraphQL },
            { nombre: 'API REST in-browser', fn: estrategiaApiRestInBrowser },
            { nombre: 'DOM scroll', fn: estrategiaDomScroll },
            { nombre: 'ScrapFly externo', fn: estrategiaScrapFly },
            { nombre: 'Apify externo', fn: estrategiaServicioExterno },
          ];

    let mejorResultado: Participante[] = [];

    for (const estrategia of estrategias) {
      try {
        console.log(`Instagram V2: intentando ${estrategia.nombre}...`);
        const resultado = await estrategia.fn(ctx);
        console.log(`Instagram V2: ${estrategia.nombre} -> ${resultado.length} participantes`);

        if (resultado.length > mejorResultado.length) {
          mejorResultado = resultado;
        }

        // ¿Cumple el umbral mínimo (50% de lo esperado)?
        if (cantidadEsperada && resultado.length >= cantidadEsperada * UMBRAL_MINIMO) {
          console.log(`Instagram V2: ${estrategia.nombre} cumple el umbral (${resultado.length}/${cantidadEsperada})`);
          return (eliminarDuplicados ? deduplicar(resultado) : resultado).slice(0, cantidadMaxima);
        }

        if (!cantidadEsperada && resultado.length >= 20) {
          console.log(`Instagram V2: ${estrategia.nombre} obtuvo un resultado razonable (${resultado.length})`);
          return (eliminarDuplicados ? deduplicar(resultado) : resultado).slice(0, cantidadMaxima);
        }
      } catch (e) {
        if (e instanceof CuotaAgotadaError) {
          throw e;
        }
        console.error(`Instagram V2: ${estrategia.nombre} falló:`, (e as Error).message);
      }
    }

    if (mejorResultado.length > 0) {
      console.log(`Instagram V2: retornando mejor resultado: ${mejorResultado.length} participantes`);
      return (eliminarDuplicados ? deduplicar(mejorResultado) : mejorResultado).slice(0, cantidadMaxima);
    }

    console.warn('Instagram V2: ninguna estrategia obtuvo resultados');
    return [];
  } catch (error) {
    if (error instanceof CuotaAgotadaError) {
      throw error;
    }
    console.error('Instagram V2: error en recolección:', error);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export { IG_APP_ID };
