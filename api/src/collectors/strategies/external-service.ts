import { Participante } from '../types';
import { ContextoScraping } from './types';
import { cuotaDisponibleHoy, registrarUsoApify, CuotaAgotadaError } from '../../lib/cuota';

// La API de Apify usa formato `owner~actor` (tilde), no `owner/actor`
// Actor: instax/instagram-only-0-75-get-post-info---all-comments-replies
// - "No login required": trae todos los comentarios top-level sin sesión
//   (verificado en vivo: 105 de 152 en el post de prueba; el resto son
//   respuestas que IG cuenta aparte). Costo: 0.75 USD/1000 resultados.
// - El actor oficial apify~instagram-comment-scraper quedó en ~15 sin sesión.
const APIFY_ACTOR = 'instax~instagram-only-0-75-get-post-info---all-comments-replies';
const APIFY_API = 'https://api.apify.com/v2';

// Estrategia D: servicio externo (Apify) que usa sus propias sesiones/proxies.
// Es la única vía para obtener la mayoría de los comentarios SIN que el usuario
// se loguee en Instagram. Requiere APIFY_TOKEN en el .env (free tier: 5 USD/mes).
export async function estrategiaServicioExterno(ctx: ContextoScraping): Promise<Participante[]> {
  const token = process.env.APIFY_TOKEN;
  if (!token) {
    console.log('Instagram V2 [Apify]: APIFY_TOKEN no configurado, skip');
    return [];
  }

  // Cuota de sorteos gratis: cada run de Apify cuesta ~$0.11 USD. Sin cuota
  // disponible y sin Pase Rápido pagado, se corta AQUÍ (no se gasta nada).
  if (!ctx.paseAprobado && !(await cuotaDisponibleHoy())) {
    console.log('Instagram V2 [Apify]: cuota de sorteos gratis agotada, requiere pase o cola');
    throw new CuotaAgotadaError();
  }

  const { url, autorExcluido, cantidadMaxima } = ctx;

  try {
    console.log('Instagram V2 [Apify]: lanzando actor de comentarios...');
    // Limpiar query params (?img_index=1) y fragmentos: rompen el parseo del actor
    const urlLimpia = url.split('?')[0].split('#')[0];
    // run-sync-get-dataset-items: ejecuta el actor, espera y devuelve los items
    // (el polling de /actor-runs de este actor falla con errores transitorios)
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 260000);
    const runRes = await fetch(
      `${APIFY_API}/acts/${APIFY_ACTOR}/run-sync-get-dataset-items?token=${token}&timeout=240`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code_or_id_or_url: [urlLimpia],
          // Tope 200 verificado: con maxComments > 200 el actor degrada a ~15
          maxComments: 200,
          scrapeReplies: false,
        }),
        signal: controller.signal,
      }
    );
    clearTimeout(timer);
    if (!runRes.ok) {
      console.log(`Instagram V2 [Apify]: error HTTP ${runRes.status}`);
      return [];
    }
    const data = await runRes.json();
    // Gasto real del actor: se contabiliza contra la cuota mensual
    await registrarUsoApify();
    const items: any[] = Array.isArray(data) ? data : [];
    if (items.length === 0) {
      console.log('Instagram V2 [Apify]: run sin items o fallido');
      return [];
    }
    // Verificado en vivo: sin sesión el actor devuelve los mismos ~15 comentarios
    // únicos (repetidos hasta 7 veces); los 152 requieren una sesión logueada.
    const participantes: Participante[] = [];
    const vistos = new Set<string>();
    const dedupe = ctx.eliminarDuplicados !== false;
    for (const item of items) {
      // El actor de Apify devuelve los campos text, user.username (u ownerUsername)
      const usuario = item?.user?.username || item?.ownerUsername || item?.username || '';
      const comentario = String(item?.text || item?.comment || '').trim();
      const clave = `${usuario.toLowerCase()}|${comentario}`;
      if (!usuario || !comentario) continue;
      if (usuario.toLowerCase() === autorExcluido.toLowerCase()) continue;
      // Con toggle ON (default) se descartan pares repetidos (el actor los devuelve varias veces)
      if (dedupe && vistos.has(clave)) continue;
      vistos.add(clave);
      participantes.push({ usuario, comentario: comentario.slice(0, 500) });
    }

    console.log(`Instagram V2 [Apify]: ${participantes.length} participantes únicos obtenidos`);
    return participantes.slice(0, cantidadMaxima);
  } catch (e) {
    console.log('Instagram V2 [Apify]: falló:', (e as Error).message);
    return [];
  }
}
