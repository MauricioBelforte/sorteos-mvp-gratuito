import { Participante } from '../types';
import { ContextoScraping } from './types';
import { abrirModalComentarios, cargarMasComentariosInstagram, extraerParesDOM } from '../instagram';

// Estrategia C: DOM scraping con el modal de comentarios + clics en "Load more
// comments" con selector estricto y detección de login wall (lógica probada del
// collector original, con scroll humanizado adicional).
export async function estrategiaDomScroll(ctx: ContextoScraping): Promise<Participante[]> {
  const { page, autorExcluido, cantidadMaxima } = ctx;

  // Los visibles ya se extraen ANTES de tocar el modal (sin sesión, el clic en
  // "Load more" redirige al login y destruye el DOM del post)
  const visibles = await extraerParesDOM(page, autorExcluido);
  console.log(`Instagram V2 [DOM]: ${visibles.length} comentarios visibles iniciales`);

  const abierto = await abrirModalComentarios(page);
  if (abierto) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
  } else {
    // Sin sesión el modal no existe; igualmente scrollear la página no dispara más cargas
    console.log('Instagram V2 [DOM]: modal no disponible (sin sesión), usando visibles');
  }

  const pares = await cargarMasComentariosInstagram(page, autorExcluido, cantidadMaxima);
  if (pares.length === 0) {
    return visibles;
  }
  return pares;
}
