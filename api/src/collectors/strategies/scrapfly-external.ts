import { Participante } from '../types';
import { ContextoScraping } from './types';
import { abrirModalComentarios, cargarMasComentariosInstagram, extraerParesDOM } from '../instagram';

const SCRAPFLY_API = 'https://api.scrapfly.io/scrape';

// Estrategia F: servicio externo ScrapFly (free tier: 1000 requests/mes).
// Devuelve el HTML renderizado del post; con `asp=true` usa su session pooling
// (sesiones compartidas que a veces incluyen sesiones logueadas de IG).
// Requiere SCRAPFLY_TOKEN en el .env; sin él se saltea.
export async function estrategiaScrapFly(ctx: ContextoScraping): Promise<Participante[]> {
  const token = process.env.SCRAPFLY_TOKEN;
  if (!token) {
    console.log('Instagram V2 [ScrapFly]: SCRAPFLY_TOKEN no configurado, skip');
    return [];
  }

  const { page, url, autorExcluido, cantidadMaxima } = ctx;

  try {
    console.log('Instagram V2 [ScrapFly]: solicitando HTML renderizado...');
    const apiUrl = `${SCRAPFLY_API}?key=${encodeURIComponent(token)}&url=${encodeURIComponent(url)}&render=true&asp=true`;
    const res = await fetch(apiUrl);
    if (!res.ok) {
      console.log(`Instagram V2 [ScrapFly]: error HTTP ${res.status}`);
      return [];
    }
    const body = await res.json();
    const html: string = body?.result?.content || '';
    if (!html) {
      console.log('Instagram V2 [ScrapFly]: sin HTML en la respuesta');
      return [];
    }
    console.log(
      `Instagram V2 [ScrapFly]: HTML obtenido (${html.length} chars, status ${body?.result?.status_code})`
    );

    // Reemplazar el DOM de la página con el HTML renderizado por ScrapFly
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const visibles = await extraerParesDOM(page, autorExcluido);
    console.log(`Instagram V2 [ScrapFly]: ${visibles.length} comentarios visibles en el HTML`);

    if (visibles.length >= 20) {
      return visibles.slice(0, cantidadMaxima);
    }

    // Si el HTML es un post completo, intentar el modal + load more (con
    // detección de login wall de la lógica probada)
    const abierto = await abrirModalComentarios(page);
    if (abierto) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1500);
    }
    const pares = await cargarMasComentariosInstagram(page, autorExcluido, cantidadMaxima);
    return (pares.length > 0 ? pares : visibles).slice(0, cantidadMaxima);
  } catch (e) {
    console.log('Instagram V2 [ScrapFly]: falló:', (e as Error).message);
    return [];
  }
}
