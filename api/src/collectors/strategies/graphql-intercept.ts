import { Participante } from '../types';
import { ContextoScraping } from './types';
import { extraerParesDOM } from '../instagram';

// Paths posibles donde Instagram pone los comentarios en el JSON de GraphQL
const COMMENT_PATHS = [
  'data.xdt_shortcode_media.edge_media_to_parent_comment',
  'data.shortcode_media.edge_media_to_parent_comment',
  'data.xdt_media.edge_media_to_parent_comment',
  'data.media.edge_media_to_parent_comment',
  'data.xdt_shortcode_media.edge_media_to_hoisted_comment',
];

function getNestedProperty(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

export function extraerComentariosDeGraphQL(data: any, autorExcluido: string): Participante[] {
  const resultados: Participante[] = [];

  for (const path of COMMENT_PATHS) {
    const edgeData = getNestedProperty(data, path);
    if (!edgeData?.edges) continue;

    for (const edge of edgeData.edges) {
      const node = edge?.node;
      if (!node) continue;

      const usuario = node.owner?.username || node.user?.username || '';
      const comentario = (node.text || '').trim();

      if (usuario && usuario.toLowerCase() !== autorExcluido.toLowerCase()) {
        resultados.push({ usuario, comentario });
      }
    }

    if (resultados.length > 0) break;
  }

  return resultados;
}

function deduplicar(lista: Participante[]): Participante[] {
  const mapa = new Map<string, Participante>();
  for (const p of lista) {
    const clave = `${p.usuario.toLowerCase()}|${p.comentario}`;
    if (!mapa.has(clave)) mapa.set(clave, p);
  }
  return Array.from(mapa.values());
}

// Estrategia A: interceptar las respuestas GraphQL que Instagram envía durante la
// navegación y sumar sus comentarios al buffer. Sin sesión Instagram solo envía el
// batch inicial; con sesión, el scroll dispara más pages.
export async function estrategiaGraphQL(ctx: ContextoScraping): Promise<Participante[]> {
  const { page, autorExcluido, cantidadMaxima } = ctx;
  const buffer: Participante[] = [];
  let paginasRecibidas = 0;
  let ultimoTimestamp = Date.now();

  const onResponse = async (response: any) => {
    const url = response.url();
    if (!url.includes('/graphql/query') && !url.includes('/graphql')) return;
    try {
      const ct = response.headers()['content-type'] || '';
      if (!ct.includes('json')) return;
      const data = await response.json();
      const comentarios = extraerComentariosDeGraphQL(data, autorExcluido);
      if (comentarios.length > 0) {
        buffer.push(...comentarios);
        paginasRecibidas += 1;
        ultimoTimestamp = Date.now();
        console.log(`Instagram V2 [GraphQL]: página ${paginasRecibidas} -> ${comentarios.length} comentarios (total ${buffer.length})`);
      }
    } catch {
      // Body ya consumido o no es JSON válido
    }
  };

  page.on('response', onResponse);

  try {
    // El DOM es la fuente base (sin sesión solo existe el batch inicial embebido)
    const domInicial = await extraerParesDOM(page, autorExcluido);
    buffer.push(...domInicial);
    console.log(`Instagram V2 [GraphQL]: ${domInicial.length} comentarios visibles en DOM`);

    let intentosSinProgreso = 0;

    for (let ciclo = 0; ciclo < 40; ciclo++) {
      if (buffer.length >= cantidadMaxima) break;

      const pideLogin = await page.evaluate(() => {
        const hayBoton = Array.from(document.querySelectorAll('button')).some((el) => {
          const t = (el.textContent || '').trim();
          return t === 'Log in' || t === 'Iniciar sesión' || t === 'Accedi';
        });
        const txt = (document.body.textContent || '').toLowerCase();
        const url = location.href;
        return hayBoton || txt.includes('log in to view') || txt.includes('inicia sesión para') || url.includes('/accounts/login');
      });
      if (pideLogin) {
        console.log('Instagram V2 [GraphQL]: login wall detectado, cortando');
        break;
      }

      // Scroll humanizado del modal y de la página
      await page.evaluate(() => {
        const dialogo = document.querySelector('[role="dialog"]');
        if (dialogo) dialogo.scrollBy({ top: 300 + Math.random() * 500, behavior: 'smooth' });
        window.scrollBy(0, 400 + Math.random() * 600);
      });

      // Clic estricto en "Load more comments"
      await page.evaluate(() => {
        const botones = Array.from(document.querySelectorAll('button, a'));
        const b = botones.find((el) => {
          const t = (el.textContent || '').trim().toLowerCase();
          const aria = (el.getAttribute('aria-label') || '').toLowerCase();
          const title = (el.querySelector('title')?.textContent || '').toLowerCase().trim();
          if (t.length > 60) return false;
          return aria.includes('load more comments') || title === 'load more comments' || t === 'load more comments' || t === 'ver más comentarios' || t === '+' || t === 'cargar más';
        });
        if (b && b instanceof HTMLElement) b.click();
      });

      await page.waitForTimeout(1200 + Math.random() * 1300);

      // Re-extraer DOM (los GraphQL suman al buffer por el listener)
      const domNuevo = await extraerParesDOM(page, autorExcluido);
      const antes = buffer.length;
      for (const p of domNuevo) {
        const clave = `${p.usuario.toLowerCase()}|${p.comentario}`;
        if (!buffer.some((b) => `${b.usuario.toLowerCase()}|${b.comentario}` === clave)) {
          buffer.push(p);
        }
      }

      if (buffer.length === antes) {
        intentosSinProgreso += 1;
        if (intentosSinProgreso >= 4) break;
      } else {
        intentosSinProgreso = 0;
      }
    }

    // Esperar brevemente por pages GraphQL en vuelo
    await page.waitForTimeout(1500);
    console.log(`Instagram V2 [GraphQL]: total ${buffer.length} participantes (${paginasRecibidas} pages GraphQL)`);
  } finally {
    page.removeListener('response', onResponse);
  }

  return (ctx.eliminarDuplicados !== false ? deduplicar(buffer) : buffer).slice(0, cantidadMaxima);
}
