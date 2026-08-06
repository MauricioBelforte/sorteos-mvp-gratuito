import { chromium, Browser, Page } from 'playwright';
import { Participante } from './types';
import fs from 'fs';
import path from 'path';

const IG_APP_ID = '936619743392459';
const SESSION_PATH = path.join(process.cwd(), '.instagram-session.json');

export { IG_APP_ID, SESSION_PATH };

export function haySesionGuardada(): boolean {
  try {
    return fs.existsSync(SESSION_PATH);
  } catch {
    return false;
  }
}

// Aceptar el banner de consentimiento de cookies (si no, la API devuelve HTML en vez de JSON)
export async function aceptarConsentimiento(page: Page): Promise<void> {
  try {
    const aceptado = await page.evaluate(() => {
      const textos = ['allow all', 'permitir todo', 'permitir', 'accept', 'aceptar', 'acepto', 'allow'];
      const botones = Array.from(document.querySelectorAll('button, div[role="button"], input[type="button"]'));
      for (const el of botones) {
        const t = (el.textContent || '').toLowerCase().trim();
        if (textos.includes(t) || t.includes('aceptar todo') || t.includes('allow all cookies')) {
          if (el instanceof HTMLElement) {
            el.click();
            return true;
          }
        }
      }
      return false;
    });
    if (aceptado) {
      console.log('Instagram: consentimiento de cookies aceptado');
      await page.waitForTimeout(2500);
    }
  } catch (e) {
    console.log('Instagram: no se pudo aceptar consentimiento:', (e as Error).message);
  }
}

// Validación de formato de username de Instagram
export function esUsernameValido(texto: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_.]{3,30}$/;
  const textoLower = texto.toLowerCase();

  if (!usernameRegex.test(texto)) return false;
  if (/^\d+$/.test(texto)) return false; // No solo números
  if (!/[a-zA-Z]/.test(texto)) return false; // Debe tener al menos una letra
  if (textoLower.endsWith('w')) return false; // Contadores de views
  if (/\d+[wk]/i.test(texto)) return false; // Contadores
  return true;
}

// Obtener el ID del media a partir del shortcode
export async function obtenerMediaId(page: Page, shortcode: string): Promise<string | null> {
  // 1) Endpoint web interno (funciona sin login)
  try {
    const id = await page.evaluate(async ({ code, appId }) => {
      const res = await fetch(`https://i.instagram.com/api/v1/web/media/${code}/info/`, {
        headers: {
          'x-ig-app-id': appId,
          'x-requested-with': 'XMLHttpRequest',
          'referer': `https://www.instagram.com/p/${code}/`,
        },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data?.media?.id || data?.items?.[0]?.pk || null;
    }, { code: shortcode, appId: IG_APP_ID });
    if (id) {
      console.log(`Instagram: mediaId obtenido vía API web interna: ${id}`);
      return String(id);
    }
  } catch (e) {
    console.log('Instagram: fallo endpoint web media info:', (e as Error).message);
  }

  // 2) Regex en el HTML de la página
  try {
    const html = await page.content();
    const match =
      html.match(/"media_id":"(\d+)"/) ||
      html.match(/"pk":"(\d{15,})"/) ||
      html.match(/"id":"(\d{15,})"/);
    if (match) {
      console.log(`Instagram: mediaId obtenido vía regex HTML: ${match[1]}`);
      return match[1];
    }
  } catch (e) {
    console.log('Instagram: fallo regex HTML:', (e as Error).message);
  }

  // 3) Endpoint __a=1 (deprecado pero a veces responde)
  try {
    const id = await page.evaluate(async (code) => {
      const res = await fetch(`https://www.instagram.com/p/${code}/?__a=1&__d=dis`);
      if (!res.ok) return null;
      const data = await res.json();
      return data?.graphql?.shortcode_media?.id || null;
    }, shortcode);
    if (id) {
      console.log(`Instagram: mediaId obtenido vía __a=1: ${id}`);
      return String(id);
    }
  } catch (e) {
    console.log('Instagram: fallo __a=1:', (e as Error).message);
  }

  return null;
}

// Fetch a la API interna de Instagram desde Node, usando las cookies del navegador
// (los fetch desde la página fallan porque Instagram los intercepta con CSP)
export async function fetchApiDesdeNode(page: Page, url: string): Promise<any> {
  const cookies = await page.context().cookies('https://www.instagram.com');
  const cookieStr = cookies.map((c) => `${c.name}=${c.value}`).join('; ');
  const csrftoken = cookies.find((c) => c.name === 'csrftoken')?.value || '';
  const ua = await page.evaluate(() => navigator.userAgent);

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': ua,
        'Cookie': cookieStr,
        'x-ig-app-id': IG_APP_ID,
        'x-asbd-id': '198387',
        'x-csrftoken': csrftoken,
        'x-requested-with': 'XMLHttpRequest',
        'referer': 'https://www.instagram.com/',
        'origin': 'https://www.instagram.com',
        'accept': 'application/json, text/plain, */*',
      },
      redirect: 'manual',
    });
    if (!res.ok) return { error: `HTTP ${res.status}` };
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return { error: 'No JSON' };
    return res.json();
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// Extraer comentarios vía la API interna de Instagram (autor + texto)
export async function extraerComentariosApi(page: Page, mediaId: string, cantidadMaxima: number, autorExcluido: string = ''): Promise<Participante[]> {
  const participantes: Participante[] = [];
  let nextMaxId: string | null = null;
  // Con sesión, pagear hasta agotar; sin sesión, pocos intentos (la API falla rápido)
  const maxIteraciones = 100;
  let iteracionesSinDatos = 0;

  for (let iteracion = 0; iteracion < maxIteraciones; iteracion++) {
    if (participantes.length >= cantidadMaxima) break;
    const hosts = [
      `https://www.instagram.com/api/v1/media/${mediaId}/comments/?can_support_threading=true&count=200${nextMaxId ? `&max_id=${nextMaxId}` : ''}`,
      `https://i.instagram.com/api/v1/media/${mediaId}/comments/?can_support_threading=true&count=200${nextMaxId ? `&max_id=${nextMaxId}` : ''}`,
    ];

    let data: any = null;
    for (const host of hosts) {
      const resultado = await fetchApiDesdeNode(page, host);
      if (resultado && !resultado.error) {
        data = resultado;
        console.log(`Instagram: API host OK: ${host.startsWith('https://i.') ? 'i.instagram.com' : 'www.instagram.com'}`);
        break;
      } else {
        console.log(`Instagram: fallo API host: ${host.startsWith('https://i.') ? 'i.instagram.com' : 'www.instagram.com'} -> ${resultado?.error || 'sin datos'}`);
      }
    }

    if (!data) break;

    const comentarios = data.comments || [];
    for (const c of comentarios) {
      const usuario = c?.user?.username;
      const comentario = (c?.text || '').trim();
      // Excluir al autor de la publicación (no puede ganar su propio sorteo)
      if (usuario && esUsernameValido(usuario) && usuario.toLowerCase() !== autorExcluido.toLowerCase()) {
        participantes.push({ usuario, comentario });
        if (participantes.length >= cantidadMaxima) {
          console.log(`Instagram: API devolvió ${participantes.length} participantes (límite ${cantidadMaxima})`);
          return participantes;
        }
      }
    }
    nextMaxId = data.next_max_id || null;
    console.log(`Instagram: API iteración ${iteracion + 1} -> ${comentarios.length} comentarios, total ${participantes.length}`);
    if (!nextMaxId) break;
  }

  return participantes;
}

// Obtener el username del autor de la publicación (el emprendimiento/cuenta que hace el sorteo)
// Se excluye de los participantes porque no puede ganar su propio sorteo.
export async function obtenerAutorInstagram(page: Page): Promise<string> {
  try {
    const html = await page.content();

    // 1) Meta og:url: https://www.instagram.com/{autor}/p/... (presente siempre sin login)
    const mUrl = html.match(/<meta property="og:url" content="https:\/\/www\.instagram\.com\/([a-zA-Z0-9_.]{1,30})\//);
    if (mUrl) {
      console.log(`Instagram: autor vía og:url (excluido): ${mUrl[1]}`);
      return mUrl[1];
    }

    // 2) Meta twitter:title: "... (@autor) • Instagram ..."
    const mTitle = html.match(/\(@([a-zA-Z0-9_.]{1,30})\) • Instagram/);
    if (mTitle) {
      console.log(`Instagram: autor vía twitter:title (excluido): ${mTitle[1]}`);
      return mTitle[1];
    }

    // 3) Header del post en el DOM (fallback)
    const autorDom = await page.evaluate(() => {
      const link = document.querySelector('header a[href^="/"]');
      if (!link) return '';
      const href = link.getAttribute('href') || '';
      const m = href.match(/^\/([a-zA-Z0-9_.]{1,30})\/?$/);
      return m ? m[1] : '';
    });
    if (autorDom) {
      console.log(`Instagram: autor vía header DOM (excluido): ${autorDom}`);
      return autorDom;
    }
  } catch (e) {
    console.log('Instagram: no se pudo obtener el autor:', (e as Error).message);
  }
  return '';
}

// Fallback: abrir el modal de comentarios y extraer pares (usuario + comentario) del DOM
export async function abrirModalComentarios(page: Page): Promise<boolean> {
  try {
    const clickeado = await page.evaluate(() => {
      const candidatos = Array.from(document.querySelectorAll('a, button, span, div'));
      const elemento = candidatos.find((el) => {
        const t = (el.textContent || '').toLowerCase().trim();
        return t === 'ver todos los comentarios' || t === 'view all comments';
      });
      if (elemento && elemento instanceof HTMLElement) {
        elemento.click();
        return true;
      }
      return false;
    });
    if (clickeado) await page.waitForTimeout(3000);
    return clickeado;
  } catch (e) {
    console.log('Instagram: no se pudo abrir el modal de comentarios:', (e as Error).message);
    return false;
  }
}

// Hacer clic repetidamente en "Ver más comentarios" ("+") del modal para cargar todos
export async function cargarMasComentariosInstagram(
  page: Page,
  autorExcluido: string,
  cantidadMaxima: number
): Promise<Participante[]> {
  // Extraer primero los comentarios ya visibles (el clic en "Load more" sin sesión
  // redirige al login y destruye el DOM del post, así que hay que capturarlos antes)
  let pares = await extraerParesDOM(page, autorExcluido);
  if (pares.length > 0) {
    console.log(`Instagram: ${pares.length} comentarios visibles iniciales`);
  }
  let intentosSinProgreso = 0;

  for (let ciclo = 0; ciclo < 60; ciclo++) {
    if (pares.length >= cantidadMaxima) break;

    // Sin sesión, "Load more comments" lleva al login: detectarlo y cortar temprano
    const pideLogin = await page.evaluate(() => {
      const hayBotonLogin = Array.from(document.querySelectorAll('button')).some((el) => {
        const t = (el.textContent || '').trim();
        return t === 'Log in' || t === 'Iniciar sesión' || t === 'Accedi';
      });
      const txt = (document.body.textContent || '').toLowerCase();
      const url = location.href;
      return hayBotonLogin || txt.includes('log in to view') || txt.includes('inicia sesión para') || url.includes('/accounts/login');
    });
    if (pideLogin) {
      console.log('Instagram: sin sesión, Instagram pide login para cargar más comentarios (se devuelven los visibles)');
      break;
    }

    const clickeado = await page.evaluate(() => {
      const candidatos = Array.from(document.querySelectorAll('button, a'));
      const elemento = candidatos.find((el) => {
        const t = (el.textContent || '').toLowerCase().trim();
        const aria = (el.getAttribute('aria-label') || '').toLowerCase();
        const title = (el.querySelector('title')?.textContent || '').toLowerCase().trim();
        // Evitar elementos gigantes (divs del login wall que contienen todo el texto de la página)
        if (t.length > 60) return false;
        return (
          aria.includes('load more comments') ||
          title === 'load more comments' ||
          t === 'load more comments' ||
          t === 'ver más comentarios' ||
          t === '+' ||
          t === 'cargar más'
        );
      });
      if (elemento && elemento instanceof HTMLElement) {
        elemento.click();
        return true;
      }
      return false;
    });

    // Scrollear el modal y la página al fondo para forzar la carga
    await page.evaluate(() => {
      const dialogo = document.querySelector('[role="dialog"]');
      if (dialogo) dialogo.scrollTop = dialogo.scrollHeight;
      window.scrollTo(0, document.body.scrollHeight);
    });

    if (clickeado) await page.waitForTimeout(1400);
    else await page.waitForTimeout(700);

    const nuevos = await extraerParesDOM(page, autorExcluido);
    if (nuevos.length === pares.length) {
      intentosSinProgreso += 1;
      if (intentosSinProgreso >= 3) break;
    } else {
      intentosSinProgreso = 0;
      pares = nuevos;
      console.log(`Instagram: cargando más comentarios... ${pares.length} participantes hasta ahora`);
    }
  }

  return pares;
}

export async function extraerParesDOM(page: Page, autorExcluido: string = ''): Promise<Participante[]> {
  return page.evaluate((autor) => {
    const pares: Participante[] = [];
    const vistos = new Set<string>();
    const links = Array.from(document.querySelectorAll('a[href^="/"]'));

    for (const link of links) {
      const href = link.getAttribute('href') || '';
      // Quitar el badge "Verified" que Instagram pega al username dentro del link
      const usuario = (link.textContent || '').trim().replace(/(verified|verificado|verificada)/gi, '').trim();
      if (!href || href === '/') continue;
      const esPerfil = /^\/[a-zA-Z0-9_.]{1,30}\/?$/.test(href) || /^\/[a-zA-Z0-9_.]{1,30}\/followers/.test(href);
      if (!esPerfil || !/^[a-zA-Z0-9_.]{3,30}$/.test(usuario)) continue;

      // Excluir al autor de la publicación (no puede ganar su propio sorteo)
      if (autor && usuario.toLowerCase() === autor.toLowerCase()) continue;

      // Buscar un ancestro cercano que contenga el texto del comentario.
      // En los replies de IG el header (usuario + timestamp) es un ancestro intermedio
      // sin el texto real: hay que quedarse con el ancestro MÁS LARGO que contenga al
      // usuario y a pocos perfiles distintos (la lista completa de comentarios
      // contiene cientos de perfiles y debe descartarse).
      let nodo: HTMLElement | null = link.parentElement;
      let mejor: { texto: string; nivel: number } | null = null;
      for (let i = 0; i < 6 && nodo; i++) {
        const texto = (nodo.textContent || '').trim();
        if (texto.length > 25 && texto.includes(usuario)) {
          const perfilesDistintos = new Set(
            Array.from(nodo.querySelectorAll('a[href^="/"]'))
              .map((a) => a.getAttribute('href') || '')
              .filter((h) => /^\/[a-zA-Z0-9_.]{1,30}\/?$/.test(h))
          ).size;
          if (perfilesDistintos <= 4 && (!mejor || texto.length > mejor.texto.length)) {
            mejor = { texto, nivel: i };
          }
        }
        nodo = nodo.parentElement;
      }
      if (mejor) {
        const texto = mejor.texto;
        const comentario = texto
          .replace(usuario, '')
          .trim()
          .replace(/^[·•\s]+/, '')
          .replace(/\s{2,}/g, ' ')
          // Quitar etiquetas de UI que conviven con el comentario en el mismo ancestro:
          // timestamps AL INICIO (13m, 2h, 3d, 1w / 186w pegado al texto) y botones
          // like/reply/respuestas (sueltos o pegados). Unidades largas primero.
          .replace(/^\d{1,4}\s*(semanas?|sem\.?|horas?|min\.?|minutos?|años?|año|meses?|mes|días?|día|dias?|w|d|h|m)/i, ' ')
          .replace(/\b\d{1,3}\s?[mhdw]\b/gi, ' ')
          .replace(
            /(reply|responder|ver respuestas|view replies|ver más respuestas|view more replies|like|me gusta|gusta|liked|editado|edited|traducir|translate|denunciar|report)/gi,
            ' '
          )
          .replace(/\s{2,}/g, ' ')
          .trim()
          .slice(0, 500);

        // Descartar basura de UI (footer de Meta, estados de la publicación, etc.).
        // Se quitan las menciones @usuario ANTES del chequeo: el username puede
        // contener subcadenas de las palabras basura (ej: "noeliaAPIcone" -> "api").
        const textoLower = comentario.toLowerCase().replace(/@[a-z0-9_.]+/g, '');
        const esBasura =
          /^\d+[hd]/.test(textoLower) ||
          comentario.length < 2 ||
          ['privacy', 'terms', 'about', 'blog', 'jobs', 'help', 'api', 'instagram lite', 'suggested', 'sugerencias'].some((b) => textoLower.includes(b));

        if (comentario && !esBasura && !vistos.has(comentario)) {
          vistos.add(comentario);
          pares.push({ usuario, comentario });
        }
      }
    }

    return [...new Map(pares.map((p) => [`${p.usuario}|${p.comentario}`, p])).values()];
  }, autorExcluido);
}

export async function recolectarInstagram(
  url: string,
  cantidadMaxima: number = 600,
  cookieStr: string = ''
): Promise<Participante[]> {
  let browser: Browser | null = null;

  try {
    // Sesión guardada (login asistido) → todas las cookies de la cuenta, prioridad tras las pegadas
    const usaSesionGuardada = !cookieStr && haySesionGuardada();
    console.log(
      `Instagram: Iniciando scraping de ${url}${cookieStr ? ' (con cookies pegadas)' : usaSesionGuardada ? ' (con sesión guardada)' : ''}`
    );
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext(usaSesionGuardada ? { storageState: SESSION_PATH } : {});
    const page = await context.newPage();

    // Si el usuario pegó sus cookies de sesión, usarlas (desbloquea TODOS los comentarios)
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
          console.log(`Instagram: ${cookies.length} cookies de sesión aplicadas`);
        }
      } catch (e) {
        console.log('Instagram: no se pudieron aplicar las cookies:', (e as Error).message);
      }
    }

    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    });

    await page.goto(url, { waitUntil: 'networkidle', timeout: 40000 });
    await page.waitForTimeout(4000);

    // Aceptar consentimiento de cookies para poder usar la API interna
    await aceptarConsentimiento(page);

    // El autor de la publicación no puede participar en su propio sorteo
    const autor = await obtenerAutorInstagram(page);

    const shortcode = url.match(/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/)?.[1] || '';

    // Estrategia principal: API interna de comentarios (autor + comentario)
    if (shortcode) {
      const mediaId = await obtenerMediaId(page, shortcode);
      if (mediaId) {
        const viaApi = await extraerComentariosApi(page, mediaId, cantidadMaxima, autor);
        if (viaApi.length > 0) {
          console.log(`Instagram: ${viaApi.length} participantes obtenidos vía API interna`);
          console.log(`Instagram: Primeros: ${viaApi.slice(0, 5).map((p) => `@${p.usuario}: ${p.comentario.slice(0, 40)}`).join(' | ')}`);
          return viaApi;
        }
      }
    }

    // Fallback 1: modal de comentarios + clic en "Ver más comentarios" ("+") hasta agotar
    console.log('Instagram: API sin resultados, probando extracción DOM del modal...');
    const abierto = await abrirModalComentarios(page);
    if (abierto) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);
    }
    const paresDom = await cargarMasComentariosInstagram(page, autor, cantidadMaxima);
    if (paresDom.length > 0) {
      console.log(`Instagram: ${paresDom.length} participantes obtenidos vía DOM (carga completa)`);
      return paresDom.slice(0, cantidadMaxima);
    }

    console.warn('Instagram: No se encontraron participantes (API y DOM sin resultados)');
    return [];
  } catch (error) {
    console.error('Instagram: Error en recolección:', error);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export function validarUrlInstagram(url: string): boolean {
  return /^https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel)\/[a-zA-Z0-9_-]+/.test(url);
}
