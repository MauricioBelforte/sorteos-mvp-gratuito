import { chromium, Browser, Page } from 'playwright';
import { Participante } from './types';

export async function recolectarYouTube(url: string, cantidadMaxima: number = 600): Promise<Participante[]> {
  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle', timeout: 40000 });
    await page.waitForTimeout(3000);

    // Scroll hasta la sección de comentarios para activar el lazy-load
    const seccionComentarios = await page.evaluate(() => {
      const seccion = document.querySelector('ytd-comments');
      if (seccion) {
        seccion.scrollIntoView({ block: 'center' });
        return true;
      }
      return false;
    });
    if (seccionComentarios) {
      await page.waitForTimeout(5000);
      for (let i = 0; i < 5; i++) {
        await page.evaluate(() => window.scrollBy(0, 400));
        await page.waitForTimeout(800);
      }
      await page.waitForTimeout(3000);
    }

    // El canal autor del video no puede participar en su propio sorteo
    const canalAutor = await page.evaluate(() => {
      const el = document.querySelector(
        'ytd-video-owner-renderer a#text, #owner #text a, ytd-channel-name #text, #channel-handle'
      );
      const texto = el?.textContent?.trim() || '';
      const m = texto.match(/^@?([a-zA-Z0-9_\-]{2,30})$/);
      return m ? m[1] : texto.replace(/^@/, '').split(' ')[0];
    });
    if (canalAutor) {
      console.log(`YouTube: canal autor (excluido): ${canalAutor}`);
    }

    // Scroll iterativo: bajar y volver a extraer hasta que deje de crecer o se alcance el límite
    const extraerPares = () =>
      page.evaluate((canal) => {
        const resultado: Participante[] = [];
        const threads = document.querySelectorAll('ytd-comment-thread-renderer');

        threads.forEach((thread) => {
          const autorEl = thread.querySelector('#author-text span');
          const textoEl = thread.querySelector('#content-text');
          const usuario = (autorEl?.textContent || '').trim().replace(/^@/, '');
          const comentario = (textoEl?.textContent || '').trim();
          if (!usuario || !comentario) return;
          // Excluir al canal autor del video (no puede ganar su propio sorteo)
          if (canal && usuario.toLowerCase() === canal.toLowerCase()) return;
          // Descartar el hilo fijado con estadísticas de YouTube
          if (/^comments/i.test(comentario) && /\d+%/.test(comentario)) return;
          resultado.push({ usuario, comentario: comentario.slice(0, 500) });
        });

        return resultado;
      }, canalAutor);

    let participantes = await extraerPares();
    let intentosSinProgreso = 0;

    for (let ciclo = 0; ciclo < 40; ciclo++) {
      if (participantes.length >= cantidadMaxima) break;

      await page.evaluate(() => {
        window.scrollBy(0, 700);
        const ultimoThread = document.querySelector('ytd-comment-thread-renderer:last-of-type');
        if (ultimoThread) ultimoThread.scrollIntoView({ block: 'center' });
      });
      await page.waitForTimeout(1200);

      const nuevos = await extraerPares();
      if (nuevos.length === participantes.length) {
        intentosSinProgreso += 1;
        if (intentosSinProgreso >= 4) break;
      } else {
        intentosSinProgreso = 0;
        participantes = nuevos;
        console.log(`YouTube: cargando más comentarios... ${participantes.length} participantes hasta ahora`);
      }
    }

    const unicos = [...new Map(participantes.map((p) => [`${p.usuario}|${p.comentario}`, p])).values()];
    console.log(`YouTube: ${unicos.length} participantes (autor + comentario)`);
    return unicos.slice(0, cantidadMaxima);
  } catch (error) {
    console.error('Error recolectando YouTube:', error);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export function validarUrlYouTube(url: string): boolean {
  return /^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-]+/.test(url);
}
