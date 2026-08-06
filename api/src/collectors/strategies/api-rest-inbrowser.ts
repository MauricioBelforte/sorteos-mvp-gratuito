import { Participante } from '../types';
import { ContextoScraping } from './types';
import { IG_APP_ID } from '../instagram';

function deduplicar(lista: Participante[]): Participante[] {
  const mapa = new Map<string, Participante>();
  for (const p of lista) {
    const clave = `${p.usuario.toLowerCase()}|${p.comentario}`;
    if (!mapa.has(clave)) mapa.set(clave, p);
  }
  return Array.from(mapa.values());
}

// Estrategia B: hacer el fetch de la API REST DENTRO del navegador (no desde Node),
// para que la request salga con el TLS fingerprint real de Chromium y las cookies.
// Sin sesión la API devuelve el login wall (HTML) y se aborta rápido.
// Con sesión (cookies pegadas o guardada) pagina hasta agotar next_max_id.
export async function estrategiaApiRestInBrowser(ctx: ContextoScraping): Promise<Participante[]> {
  const { page, mediaId, autorExcluido, cantidadMaxima } = ctx;

  if (!mediaId) {
    console.log('Instagram V2 [API in-browser]: sin mediaId, skip');
    return [];
  }

  const participantes: Participante[] = [];
  let nextMaxId: string | null = null;
  let aborter = false;

  for (let iteracion = 0; iteracion < 100; iteracion++) {
    if (participantes.length >= cantidadMaxima || aborter) break;

    const data: any = await page.evaluate(
      async ({ id, maxId, appId }) => {
        const url = `https://www.instagram.com/api/v1/media/${id}/comments/?can_support_threading=true&count=200${maxId ? `&max_id=${maxId}` : ''}`;
        // La API autenticada exige el X-CSRFToken (cookie csrftoken) además del sessionid
        const csrfMatch = document.cookie.match(/(?:^|;)\s*csrftoken=([^;]+)/);
        const csrf = csrfMatch ? csrfMatch[1] : '';
        try {
          const res = await fetch(url, {
            headers: {
              'x-ig-app-id': appId,
              'x-requested-with': 'XMLHttpRequest',
              ...(csrf ? { 'x-csrftoken': csrf } : {}),
            },
            credentials: 'include',
          });
          if (!res.ok) return { error: `HTTP ${res.status}` };
          const ct = res.headers.get('content-type') || '';
          if (!ct.includes('json')) return { error: `No JSON (${ct.slice(0, 30)})`, esHTML: ct.includes('html') };
          return await res.json();
        } catch (e: any) {
          return { error: e.message };
        }
      },
      { id: mediaId, maxId: nextMaxId, appId: IG_APP_ID }
    );

    if (data?.error) {
      // Sin sesión, IG responde el login wall como HTML o bloquea con CSP
      console.log(`Instagram V2 [API in-browser]: ${data.error}${data.esHTML ? ' (login wall)' : ''} - deteniendo`);
      break;
    }

    const comentarios = data.comments || [];
    for (const c of comentarios) {
      const usuario = c?.user?.username;
      const comentario = (c?.text || '').trim();
      if (usuario && usuario.toLowerCase() !== autorExcluido.toLowerCase()) {
        participantes.push({ usuario, comentario });
      }
    }

    nextMaxId = data.next_max_id || null;
    console.log(`Instagram V2 [API in-browser]: iteración ${iteracion + 1} -> ${comentarios.length} comentarios, total ${participantes.length}`);

    if (!nextMaxId) break;
    await page.waitForTimeout(500 + Math.random() * 800);
  }

  return (ctx.eliminarDuplicados !== false ? deduplicar(participantes) : participantes).slice(0, cantidadMaxima);
}
