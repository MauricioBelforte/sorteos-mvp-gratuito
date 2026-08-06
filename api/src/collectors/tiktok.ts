import { chromium, Browser, Page } from 'playwright';
import { Participante } from './types';

export async function recolectarTikTok(url: string, cantidadMaxima: number = 600): Promise<Participante[]> {
  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle', timeout: 40000 });
    await page.waitForTimeout(4000);

    // El autor del video no puede participar en su propio sorteo
    const autorVideo = await page.evaluate(() => {
      const el = document.querySelector('[data-e2e="video-author-uniqueid"], h2 a[href^="/@"], [data-e2e="user-title"]');
      const texto = el?.textContent?.trim() || '';
      const m = texto.match(/^@?([a-zA-Z0-9_\-\.]{2,30})$/);
      return m ? m[1] : texto.replace(/^@/, '').trim();
    });
    if (autorVideo) {
      console.log(`TikTok: autor del video (excluido): ${autorVideo}`);
    }

    // Scroll hasta la sección de comentarios para activar el lazy-load
    await page.evaluate(() => {
      const panel = document.querySelector('[data-e2e="comment-list"]');
      if (panel) panel.scrollIntoView({ block: 'center' });
    });
    await page.waitForTimeout(3000);

    // Extraer pares (autor + texto) por contenedor de comentario
    const extraerPares = () =>
      page.evaluate((autor) => {
        const resultado: Participante[] = [];
        const items = document.querySelectorAll('[data-e2e="comment-item"]');

        items.forEach((item) => {
          const autorEl = item.querySelector('[data-e2e="comment-username"]');
          const textoEl = item.querySelector('[data-e2e="comment-text"]');
          const usuario = (autorEl?.textContent || '').trim().replace(/^@/, '');
          const comentario = (textoEl?.textContent || '').trim();
          if (!usuario || !comentario) return;
          // Excluir al autor del video (no puede ganar su propio sorteo)
          if (autor && usuario.toLowerCase() === autor.toLowerCase()) return;
          resultado.push({ usuario, comentario: comentario.slice(0, 500) });
        });

        return resultado;
      }, autorVideo);

    let participantes = await extraerPares();
    let intentosSinProgreso = 0;

    // Clic en "Ver más comentarios" y scroll hasta que deje de crecer o se alcance el límite
    for (let ciclo = 0; ciclo < 60; ciclo++) {
      if (participantes.length >= cantidadMaxima) break;

      const clickeado = await page.evaluate(() => {
        const textos = ['ver más comentarios', 'load more comments', 'ver más', 'más comentarios', 'more comments', 'xem thêm bình luận'];
        const candidatos = Array.from(document.querySelectorAll('button, div, span'));
        const elemento = candidatos.find((el) => {
          const t = (el.textContent || '').toLowerCase().trim();
          const aria = (el.getAttribute('aria-label') || '').toLowerCase();
          return textos.some((x) => t === x || t.includes(x) || aria.includes(x));
        });
        if (elemento && elemento instanceof HTMLElement) {
          elemento.click();
          return true;
        }
        return false;
      });

      await page.evaluate(() => {
        window.scrollBy(0, 700);
        const lista = document.querySelector('[data-e2e="comment-list"]');
        if (lista) lista.scrollTop = lista.scrollHeight;
      });

      if (clickeado) await page.waitForTimeout(1400);
      else await page.waitForTimeout(900);

      const nuevos = await extraerPares();
      if (nuevos.length === participantes.length) {
        intentosSinProgreso += 1;
        if (intentosSinProgreso >= 3) break;
      } else {
        intentosSinProgreso = 0;
        participantes = nuevos;
        console.log(`TikTok: cargando más comentarios... ${participantes.length} participantes hasta ahora`);
      }
    }

    const unicos = [...new Map(participantes.map((p) => [`${p.usuario}|${p.comentario}`, p])).values()];
    console.log(`TikTok: ${unicos.length} participantes (autor + comentario)`);
    return unicos.slice(0, cantidadMaxima);
  } catch (error) {
    console.error('Error recolectando TikTok:', error);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export function validarUrlTikTok(url: string): boolean {
  return /^https?:\/\/(?:www\.)?tiktok\.com\/@[^/]+\/video\/\d+|https?:\/\/vm\.tiktok\.com\//.test(url);
}
