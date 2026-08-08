import { Participante } from '../types';
import { ContextoScraping } from './types';
import { extraerParesDOM, aceptarConsentimiento } from '../instagram';
import { extraerComentariosDeGraphQL } from './graphql-intercept';
import { memoriaContenedor, logMemoria } from '../../lib/memoria';

// ============================================================================
// Estrategia G-ZERO (propuesta Gemini 3.6, módulo 10, 2026-08-07).
// Scroll anónimo completo con control ESTRICTO de la RAM del contenedor, para
// que la nube free de Render (512 MB) no muera por OOM en posts GRANDES.
//
// Diferencias vs G clásica (scroll-anon-completo.ts):
//   1. Interceptor de red (page.on('response')): los comentarios que IG manda
//      por GraphQL/JSON se parsean EN NODE y se suman al Map `vistos`. El DOM
//      del navegador es solo respaldo (si el JSON viene encriptado o cortado).
//   2. DOM Wiping: periódicamente se VACÍA la lista de comentarios del DOM
//      (conservando pocos nodos para no cortar el scroll). El renderer de
//      Chromium queda plano (~20-25 MB) aunque se scrollearon miles.
//   3. RAM Governor: si el cgroup llega al 75% del límite, se recicla la
//      página (close + gc + nueva) para bajar el pico antes del OOM.
//
// La G clásica NO se toca: este handler convive bajo SCRAPER_MODE=gzero.
// ============================================================================

const TIMESTAMP_RE = /^\d+\s*(semanas?|sem\.?|horas?|min\.?|minutos?|años?|año|meses?|mes|días?|día|dias?|w|d|h|m)/i;

const NAVBAR_USUARIOS = new Set([
  'home', 'search', 'explore', 'reels', 'messages', 'notifications', 'create',
  'profile', 'settings', 'suggested', 'sugerencias', 'activity', 'bookmark',
  'threads', 'meta', 'about', 'help', 'privacy', 'terms',
]);

const UI_COMENTARIO_RE = /^(home|search|explore|reels|messages|notifications|create|profile|settings|suggested)\1/i;
const LIKES_POST_RE = /(liked by|me gusta a)\b|(?:^| )d by and \d+ others|and \d+ others$/i;

// Mismo bloqueo de recursos pesados que G clásica (imágenes/videos/fuentes:
// solo agregan MB de buffers sin aportar comentarios).
async function bloquearRecursosPesados(scope: import('playwright').Page | import('playwright').BrowserContext): Promise<void> {
  await scope
    .route('**/*', (route) => {
      const tipo = route.request().resourceType();
      if (tipo === 'image' || tipo === 'media' || tipo === 'font') return route.abort();
      return route.continue();
    })
    .catch(() => {
      /* si ya hay una route registrada, no es bloqueante */
    });
}

export async function estrategiaScrollAnonimoGZero(ctx: ContextoScraping): Promise<Participante[]> {
  const { url, autorExcluido, cantidadMaxima, cantidadEsperada } = ctx;
  const vistos = new Map<string, Participante>();

  // ---- Contexto propio SIEMPRE (anónimo puro) ----
  // CRÍTICO (2026-08-08): antes solo se abría contexto nuevo si había sesión.
  // Sin sesión (prod) la recolección usaba la página del orquestador y el
  // governor no podía liberar la RAM (reload no suelta el renderer) → OOM en
  // posts de ~1000. Ahora SIEMPRE se usa un contexto dedicado cerrable.
  let page = ctx.page;
  let contextoAnonimo: import('playwright').BrowserContext | null = null;
  try {
    const browser = ctx.page.context().browser();
    if (browser) {
      contextoAnonimo = await browser.newContext();
      await bloquearRecursosPesados(contextoAnonimo);
      page = await contextoAnonimo.newPage();
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      });
      // domcontentloaded (NO networkidle): IG tir?? XHR continuos en posts
      // grandes → networkidle nunca se calma y cuelga la corrida (verificado
      // con post de 2538 comentarios, 2026-08-07). La captura entra igual
      // por el listener GraphQL + DOM.
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(3000);
      await aceptarConsentimiento(page);
    }
  } catch (e) {
    console.error('Instagram V2 [G-Zero]: no se pudo abrir contexto propio, usando el actual:', (e as Error).message);
    page = ctx.page;
  }
  await bloquearRecursosPesados(page);

  const limpiar = (t: string): string => t.trim().replace(TIMESTAMP_RE, '').trim();

  const esBasura = (p: Participante): boolean => {
    const usuario = p.usuario.toLowerCase();
    if (NAVBAR_USUARIOS.has(usuario)) return true;
    const comentario = p.comentario.trim();
    if (!comentario) return true;
    if (LIKES_POST_RE.test(comentario)) return true;
    if (UI_COMENTARIO_RE.test(comentario.replace(/\s/g, ''))) return true;
    if (/^(liked|me gusta)/i.test(comentario) && /\d+\s*(others|personas|personas más)/i.test(comentario)) return true;
    return false;
  };

  // Map central en Node: únicos por usuario|comentario. Aquí llegan TANTO el
  // interceptor GraphQL (fuente primaria) como el DOM residual (fallback).
  let agregadosGraphQL = 0;
  const agregar = (pares: Participante[]): number => {
    let nuevos = 0;
    for (const p of pares) {
      if (esBasura(p)) continue;
      const comentario = limpiar(p.comentario);
      if (!comentario) continue;
      const clave = `${p.usuario.toLowerCase()}|${comentario}`;
      if (!vistos.has(clave)) {
        vistos.set(clave, { usuario: p.usuario, comentario });
        nuevos += 1;
      }
    }
    return nuevos;
  };

  // Listener un solo closure que agrega al Map global; se re-registra en cada
  // página nueva (reciclado / reinicio) porque cierra con ella.
  const onResponseGraphQL = async (response: any) => {
    const url = response.url();
    if (!url.includes('/graphql') && !url.includes('/api/v1/web/comments')) return;
    try {
      const ct = response.headers()['content-type'] || '';
      if (!ct.includes('json')) return;
      const data = await response.json();
      const pares = extraerComentariosDeGraphQL(data, autorExcluido);
      if (pares.length > 0) {
        const nuevos = agregar(pares);
        agregadosGraphQL += pares.length;
        if (nuevos > 0) {
          console.log(`Instagram V2 [G-Zero GraphQL]: +${nuevos} nuevos (${vistos.size} total)`);
        }
      }
    } catch {
      /* body consumido o no es JSON parseable */
    }
  };
  page.on('response', onResponseGraphQL);

  const cerrarDialogos = async (): Promise<boolean> => {
    const cerrado = await page
      .evaluate(() => {
        const d = document.querySelector('div[role="dialog"]');
        if (!d) return false;
        let ok = false;
        const candidatos = Array.from(d.querySelectorAll('button, div[role="button"], a, span')).filter((b) => {
          const label = (b.getAttribute('aria-label') || '').toLowerCase();
          const t = (b.textContent || '').trim().toLowerCase();
          return label.includes('cerrar') || label === 'close' || label === 'x' || t === 'cerrar' || t === 'close';
        });
        for (const c of candidatos.slice(0, 3)) {
          (c as HTMLElement).click();
          ok = true;
        }
        if (!ok) {
          const svg = d.querySelector('svg[aria-label="Cerrar"], svg[aria-label="Close"]');
          if (svg) {
            const p = svg.closest('div[role="button"], button, a') || svg.parentElement;
            (p as HTMLElement | null)?.click();
            ok = true;
          }
        }
        return ok;
      })
      .catch(() => false);
    if (cerrado) await page.waitForTimeout(2500);
    return cerrado;
  };

  // ---- DOM WIPING ENGINE (propuesta Gemini 3.6) ----
  // Los comentarios ya viven en `vistos` (Node). El DOM del navegador es
  // desechable: vaciarlo evita que el renderer de Chromium acumule miles de
  // nodos C++ (la causa real del OOM en G clásica con posts grandes).
  // CONSERVADOR: solo poda cuando hay MUCHOS nodos (posts grandes) y mantiene
  // suficientes para que IG siga enviando la carga (borrar la lista completa
  // corta el scroll infinito, verificado en local 2026-08-07).
  const MAX_NODOS_DOM = 60;
  const NUM_NODOS_MANTENER = 12;
  const DOM_WIPE_CADA_ITER = 3;
  const podarDom = async (): Promise<void> => {
    try {
      await page.evaluate(
        (param) => {
          // Robusto ante cambios de layout: sin depender de selectores de IG,
          // se poda la lista con MÁS hijos del DOM (la de comentarios es
          // siempre la más grande en un post con scroll infinito).
          const uls = Array.from(document.querySelectorAll('ul'));
          const lista = uls.sort((a, b) => b.children.length - a.children.length)[0];
          if (!lista || lista.children.length <= param.max) return;
          let aRemover = lista.children.length - param.mantener;
          while (aRemover-- > 0) {
            lista.firstElementChild?.remove();
          }
        },
        { max: MAX_NODOS_DOM, mantener: NUM_NODOS_MANTENER }
      );
    } catch {
      /* no es bloqueante */
    }
  };

  // ---- RAM GOVERNOR (propuesta Gemini 3.6, ajustada) ----
  // ÚNICA fuente de reciclado: se recicla SOLO si la memoria del contenedor
  // supera el umbral (evita el OOM ANTES de llegar al límite). En posts chicos
  // nunca dispara (la RAM queda baja) → cero regresión vs G clásica.
  // Ajuste 2026-08-08: el reciclaje de PÁGINA no libera el renderer (la RAM del
  // DOM gigante queda retenida) → se recicla el CONTEXTO ANÓNIMO COMPLETO.
  // Umbral bajado a 0.60 (margen real antes de los 512 Mi) y RSS propio como
  // doble señal (protege también sin cgroup, ej. localhost con DOM gigante).
  let reciclados = 0;
  const RECICLADOS_MAXIMOS = 25;
  const UMBRAL_ANON = 0.62;
  const UMBRAL_RSS_MB = 400;
  const debeGobernarMemoria = (): boolean => {
    const m = memoriaContenedor();
    // Señal principal: memoria ANÓNIMA del cgroup (la que provoca OOM).
    // memory.current infla con page cache reclamable y disparaba en falso.
    if (m.limiteMb > 0 && m.anonMb > 0 && m.anonMb >= m.limiteMb * UMBRAL_ANON) {
      console.log(`G-Zero [RAM Governor]: anon ${m.anonMb}/${m.limiteMb} MB >= ${Math.round(UMBRAL_ANON * 100)}% -> reciclar contexto`);
      return true;
    }
    // Señal B: uso total muy cerca del límite (por si anon no está disponible).
    if (m.limiteMb > 0 && m.usadoMb >= m.limiteMb * 0.8) {
      console.log(`G-Zero [RAM Governor]: total ${m.usadoMb}/${m.limiteMb} MB >= 80% -> reciclar contexto`);
      return true;
    }
    if (m.rssMb >= UMBRAL_RSS_MB) {
      console.log(`G-Zero [RAM Governor]: RSS ${m.rssMb} MB >= ${UMBRAL_RSS_MB} -> reciclar contexto`);
      return true;
    }
    return false;
  };

  try {
    // En posts GRANDES el DOM inicial es gigantesco (2538 comentarios = miles de
    // nodos). Parsearlo antes del primer wipe es quemar CPU sin aportar (el
    // interceptor GraphQL ya captura el batch inicial). Solo se parsea el DOM
    // inicial si el post es chico/mediano.
    if (!cantidadEsperada || cantidadEsperada <= 800) {
      agregar(await extraerParesDOM(page, autorExcluido));
    }
  } catch {
    /* el DOM inicial puede no estar listo aún */
  }
  await cerrarDialogos();

  await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
  await page.mouse.move(1000, 450).catch(() => {});
  await page.mouse.wheel(0, -5000).catch(() => {});
  await page.waitForTimeout(1200);

  let sinProgreso = 0;
  let rebotado = false;
  let gqlPrevio = 0;
  const iteraciones = cantidadEsperada ? Math.min(300, Math.max(40, Math.ceil(cantidadEsperada / 15))) : 40;
  const toleranciaSinProgreso = cantidadEsperada && cantidadEsperada > 600 ? 10 : 7;
  const reiniciosMaximos = 3;
  let reinicios = 0;

  logMemoria('inicio recolección (G-Zero)');

  const recargarPaginaGZero = async (motivo: string): Promise<void> => {
    try {
      page.removeListener('response', onResponseGraphQL);
      const browser = ctx.page.context().browser();
      if (contextoAnonimo) {
        // Cerrar el contexto COMPLETO libera el renderer (poda dom no basta:
        // la RAM del DOM gigante queda retenida en Chromium).
        await contextoAnonimo.close().catch(() => {});
        contextoAnonimo = null;
        if (browser) {
          contextoAnonimo = await browser.newContext();
          await bloquearRecursosPesados(contextoAnonimo);
          page = await contextoAnonimo.newPage();
          await page.setExtraHTTPHeaders({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          });
        }
      } else {
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
      }
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
      page.on('response', onResponseGraphQL);
    } catch (e) {
      console.error(`Instagram V2 [G-Zero]: error en ${motivo}:`, (e as Error).message);
    }
    await page.waitForTimeout(2500);
    await aceptarConsentimiento(page);
    await cerrarDialogos();
    await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
    await page.mouse.move(1000, 450).catch(() => {});
    await page.mouse.wheel(0, -5000).catch(() => {});
    await page.waitForTimeout(1500);
  };

  for (let i = 0; i < iteraciones; i++) {
    const antes = vistos.size;

    // Fuente 1: GraphQL (listener). Fuente 2: DOM fallback solo si el listener
    // no capturó NADA desde la iteración anterior (el DOM es caro en posts
    // grandes; no se recorre en cada iteración).
    if (agregadosGraphQL === gqlPrevio) {
      try {
        agregar(await extraerParesDOM(page, autorExcluido));
      } catch {
        /* noop */
      }
    }

    if (vistos.size === antes) sinProgreso += 1;
    else sinProgreso = 0;

    if (sinProgreso >= 3 && !rebotado) {
      await page.mouse.wheel(0, -1500).catch(() => {});
      await page.waitForTimeout(900);
      rebotado = true;
    }

    // Reinicio por estancamiento (misma lógica que G clásica)
    if (sinProgreso >= toleranciaSinProgreso && reinicios < reiniciosMaximos && vistos.size > 0) {
      reinicios += 1;
      console.log(`Instagram G-Zero: reinicio ${reinicios}/${reiniciosMaximos} tras ${sinProgreso} ciclos (${vistos.size} capturados)`);
      sinProgreso = 0;
      rebotado = false;
      await recargarPaginaGZero('reinicio');
      continue;
    }

    // RAM Governor: si el contenedor superó el umbral, reciclar ANTES del OOM.
    // Local (sin cgroup: limiteMb=0) NUNCA dispara → prueba de paridad con G.
    // Además, en posts GRANDES se fuerza un reciclaje preventivo del contexto
    // cada RCICLADO_PREVENTIVO_CADA_ITER iteraciones (el renderer de Chromium
    // acumula la RAM del DOM gigante incluso con poda; cerrar el contexto es la
    // única forma real de liberarla - verificado 2026-08-08).
    const RCICLADO_PREVENTIVO_CADA_ITER = 14;
    const postGrande = !!cantidadEsperada && cantidadEsperada > 800;
    if (postGrande && i > 0 && i % RCICLADO_PREVENTIVO_CADA_ITER === 0 && reciclados < RECICLADOS_MAXIMOS) {
      reciclados += 1;
      console.log(`Instagram G-Zero: reciclado preventivo ${reciclados}/${RECICLADOS_MAXIMOS} iter ${i} (${vistos.size} capturados)`);
      sinProgreso = 0;
      rebotado = false;
      await recargarPaginaGZero('preventivo');
      logMemoria(`post-preventivo ${reciclados} (${vistos.size} capturados)`);
      continue;
    }
    if (debeGobernarMemoria() && reciclados < RECICLADOS_MAXIMOS) {
      reciclados += 1;
      console.log(`Instagram G-Zero: reciclado ${reciclados}/${RECICLADOS_MAXIMOS} iter ${i} (${vistos.size} capturados)`);
      sinProgreso = 0;
      rebotado = false;
      await recargarPaginaGZero('reciclado-mem');
      logMemoria(`post-reciclado ${reciclados} (${vistos.size} capturados)`);
      continue;
    }

    // DOM Wiping: en posts grandes se poda en CADA iteración (el DOM crece
    // rápido y el renderer de Chromium es quien se come la RAM); en chicos
    // alcanza cada 3. Nunca cae por debajo de NUM_NODOS_MANTENER.
    if (i > 0 && (postGrande || i % DOM_WIPE_CADA_ITER === 0)) {
      await podarDom();
    }

    if (vistos.size >= cantidadMaxima) break;

    // Scroll real con rueda sobre la columna derecha (requisito IG)
    await page.mouse.move(1000, 450).catch(() => {});
    await page.mouse.wheel(0, 2200).catch(() => {});
    await page.waitForTimeout(1400 + Math.random() * 800);

    const cargar = page
      .getByText(/cargar más comentarios|load more comments|ver más comentarios|view more comments/i)
      .first();
    const visible = await cargar.isVisible().catch(() => false);
    if (visible) {
      await cargar.click({ timeout: 3000 }).catch(() => {});
    }

    await page.mouse.move(1000, 450).catch(() => {});
    await page.mouse.wheel(0, 2200).catch(() => {});
    await page.waitForTimeout(1600 + Math.random() * 800);

    const hayDialog = await page.evaluate(() => !!document.querySelector('div[role="dialog"]')).catch(() => false);
    if (hayDialog) await cerrarDialogos();

    gqlPrevio = agregadosGraphQL;

    if (i % 5 === 0) {
      logMemoria(`iter-${i} (${vistos.size} capturados, gql=${agregadosGraphQL})`);
    }
  }

  logMemoria('fin recolección (G-Zero)');
  console.log(`Instagram G-Zero: ${vistos.size} participantes únicos`);
  try {
    page.removeListener('response', onResponseGraphQL);
  } catch {
    /* noop */
  }
  if (contextoAnonimo) {
    await contextoAnonimo.close().catch(() => {});
  }
  return [...vistos.values()].slice(0, cantidadMaxima);
}