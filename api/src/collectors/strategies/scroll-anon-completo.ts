import { Participante } from '../types';
import { ContextoScraping } from './types';
import { extraerParesDOM, aceptarConsentimiento } from '../instagram';

// Estrategia G: scroll anónimo completo (descubierta el 2026-08-03).
// Verificado en vivo en el post de prueba (comment_count: 152):
//   - Chromium de Playwright (aun headful)      -> login wall / solo ~15 comentarios
//   - Navegador REAL (headful + channel chrome) -> TODOS los top-level (~140)
// Instagram detecta la automatización (headless/DevTools/Chromium) y bloquea la
// carga infinita de comentarios; con Chrome real anónimo la muestra completa.
// La vista desktop muestra los comentarios en la columna derecha (sidebar) del
// post: el scroll con rueda debe caer SOBRE esa columna (x ~ 1000 en 1280px),
// no sobre el centro de la página (que lleva al feed de la cuenta).
// Requisito: el orquestador debe lanzar chromium headful con channel:'chrome'
// (con fallback a Chromium) cuando no hay sesión.
//
// IMPORTANTE (verificado en vivo 2026-08-05, CU7wfBaLuQK, comment_count 2538):
//   - headless + Chromium de Playwright (con sesión) -> corta en ~596
//   - Chrome real visible SIN sesión                -> 2393/2399 (99.7%)
//   - Chrome real visible CON sesión (layout logueado) -> ~18 (IG cambia el
//     layout: con sesión NO muestra la columna derecha completa con scroll
//     infinito, sino el modal de comentarios paginado).
// Por eso esta estrategia SIEMPRE se ejecuta en un contexto limpio y anónimo:
// la sesión guardada/cookies solo las usan las estrategias A/B/C.

// Limpia el timestamp literal del SSR/DOM ("125 sem", "2 h") que acompaña al texto.
// En desktop IG lo renderiza pegado al comentario ("186wLa inseguridad..."): por eso
// NO se usa \b al final (falla entre "w" y una letra). Unidades largas primero para
// no tragarse el texto real (p.ej. "2 horas" machea "horas", no "h").
const TIMESTAMP_RE = /^\d+\s*(semanas?|sem\.?|horas?|min\.?|minutos?|años?|año|meses?|mes|días?|día|dias?|w|d|h|m)/i;

// Usernames del navbar/sidebar de Instagram que extraerParesDOM confunde con perfiles
const NAVBAR_USUARIOS = new Set([
  'home', 'search', 'explore', 'reels', 'messages', 'notifications', 'create',
  'profile', 'settings', 'suggested', 'sugerencias', 'activity', 'bookmark',
  'settings', 'threads', 'meta', 'about', 'help', 'privacy', 'terms',
]);

// Textos de UI que quedan pegados como comentario (navbar concatenado, likes del post)
const UI_COMENTARIO_RE = /^(home|search|explore|reels|messages|notifications|create|profile|settings|suggested)\1/i;
const LIKES_POST_RE = /(liked by|me gusta a)\b|(?:^| )d by and \d+ others|and \d+ others$/i;

export async function estrategiaScrollAnonimo(ctx: ContextoScraping): Promise<Participante[]> {
  const { url, autorExcluido, cantidadMaxima, cantidadEsperada } = ctx;
  const vistos = new Map<string, Participante>();

  // ---- Contexto ANÓNIMO obligatorio ----
  // Con sesión el layout de IG cambia (modal paginado, sin columna derecha
  // infinita): la sesión se usa solo en A/B/C. Aquí se abre una página limpia
  // en el mismo navegador (Chrome real visible, lanzado por el orquestador).
  let page = ctx.page;
  let contextoAnonimo: import('playwright').BrowserContext | null = null;
  if (ctx.tieneSesion) {
    try {
      const browser = ctx.page.context().browser();
      if (browser) {
        contextoAnonimo = await browser.newContext();
        page = await contextoAnonimo.newPage();
        await page.setExtraHTTPHeaders({
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        });
        await page.goto(url, { waitUntil: 'networkidle', timeout: 40000 });
        await page.waitForTimeout(3000);
        await aceptarConsentimiento(page);
      }
    } catch (e) {
      console.error('Instagram V2 [Scroll anónimo]: no se pudo abrir contexto anónimo, usando el actual:', (e as Error).message);
      page = ctx.page;
    }
  }

  const limpiar = (t: string): string => {
    const texto = t.trim().replace(TIMESTAMP_RE, '').trim();
    return texto;
  };

  const esBasura = (p: Participante): boolean => {
    const usuario = p.usuario.toLowerCase();
    if (NAVBAR_USUARIOS.has(usuario)) return true;
    const comentario = p.comentario.trim();
    if (!comentario) return true;
    if (LIKES_POST_RE.test(comentario)) return true;
    // Navbar concatenado tipo "HomeHomeMessages1Messages..." o "d by and 28 others"
    if (UI_COMENTARIO_RE.test(comentario.replace(/\s/g, ''))) return true;
    if (/^(liked|me gusta)/i.test(comentario) && /\d+\s*(others|personas|personas más)/i.test(comentario)) return true;
    return false;
  };

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

  // Cierra TODOS los dialogs (login wall "Regístrate en Instagram") que bloquean
  // la vista. Instagram los renderiza con distintos selectores (button, div
  // role=button, svg aria-label=Cerrar) según el A/B que toque.
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

  try {
    agregar(await extraerParesDOM(page, autorExcluido));
  } catch {
    /* el DOM puede no estar listo aún */
  }

  await cerrarDialogos();

  // Las estrategias anteriores (A/B/C) dejan la página scrolleada al fondo y el
  // modal abierto. La carga incremental se dispara al LLEGAR al fondo, no al
  // estar en él: hay que volver arriba y bajar de a pasos. El cursor debe ir
  // sobre la columna derecha de comentarios (x ~1000 en viewport 1280px).
  await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
  await page.mouse.move(1000, 450).catch(() => {});
  await page.mouse.wheel(0, -5000).catch(() => {});
  await page.waitForTimeout(1200);

  let sinProgreso = 0;
  let rebotado = false;
  // Post con 2538 comentarios (verificado en vivo, 2026-08-05): IG carga ~600 en
  // las primeras 40 iteraciones; para listas grandes hace falta más scroll.
  // Iteraciones dinámicas según la cantidad esperada (mínimo 40, máximo 300).
  const iteraciones = cantidadEsperada
    ? Math.min(300, Math.max(40, Math.ceil(cantidadEsperada / 15)))
    : 40;
  const toleranciaSinProgreso = cantidadEsperada && cantidadEsperada > 600 ? 10 : 7;
  // GitHub issue real (2026-08-05): cuando IG deja de responder al scroll (sin
  // progreso), recargar la página y volver a bajar re-dispara la carga infinita.
  // hasta 3 recargas completas antes de rendirse.
  const reiniciosMaximos = 3;
  let reinicios = 0;
  for (let i = 0; i < iteraciones; i++) {
    const antes = vistos.size;
    try {
      agregar(await extraerParesDOM(page, autorExcluido));
    } catch {
      /* noop */
    }

    if (vistos.size === antes) sinProgreso += 1;
    else sinProgreso = 0;

    // Rebote: si el scroll se estanca, subir un poco y volver a bajar re-dispara la carga
    if (sinProgreso >= 3 && !rebotado) {
      await page.mouse.wheel(0, -1500).catch(() => {});
      await page.waitForTimeout(900);
      rebotado = true;
    }

    // Sin progreso prolongado: recargar la página puede re-disparar la carga
    // infinita de IG (el DOM ya cargado se queda "detenido" a veces).
    if (sinProgreso >= toleranciaSinProgreso && reinicios < reiniciosMaximos && vistos.size > 0) {
      reinicios += 1;
      console.log(`Instagram V2 [Scroll anónimo]: reinicio ${reinicios}/${reiniciosMaximos} tras ${sinProgreso} ciclos sin progreso (${vistos.size} capturados)`);
      sinProgreso = 0;
      rebotado = false;
      try {
        if (contextoAnonimo) {
          const browser = page.context().browser();
          await page.close().catch(() => {});
          page = await contextoAnonimo.newPage();
          await page.setExtraHTTPHeaders({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          });
          await page.goto(url, { waitUntil: 'networkidle', timeout: 40000 }).catch(() => {});
        } else {
          await page.reload({ waitUntil: 'networkidle', timeout: 40000 }).catch(() => {});
        }
      } catch (e) {
        console.error('Instagram V2 [Scroll anónimo]: error en reinicio:', (e as Error).message);
      }
      await page.waitForTimeout(2500);
      await aceptarConsentimiento(page);
      await cerrarDialogos();
      await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
      await page.mouse.move(1000, 450).catch(() => {});
      await page.mouse.wheel(0, -5000).catch(() => {});
      await page.waitForTimeout(1500);
      continue;
    }

    if (vistos.size >= cantidadMaxima) break;

    // Scroll real con rueda sobre la columna derecha de comentarios (el scroll
    // JS con window.scrollTo NO dispara la carga infinita de IG)
    await page.mouse.move(1000, 450).catch(() => {});
    await page.mouse.wheel(0, 2200).catch(() => {});
    await page.waitForTimeout(1400 + Math.random() * 800);

    // Clic nativo en "cargar más comentarios" si es visible (dispara la siguiente tanda)
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

    // El login wall puede reaparecer durante el scroll: volver a cerrarlo
    const hayDialog = await page.evaluate(() => !!document.querySelector('div[role="dialog"]')).catch(() => false);
    if (hayDialog) await cerrarDialogos();
  }

  console.log(`Instagram V2 [Scroll anónimo]: ${vistos.size} participantes únicos`);
  if (contextoAnonimo) {
    await contextoAnonimo.close().catch(() => {});
  }
  return [...vistos.values()].slice(0, cantidadMaxima);
}
