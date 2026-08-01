import { chromium, Browser, Page } from 'playwright';

export async function recolectarYouTube(url: string): Promise<string[]> {
  let browser: Browser | null = null;
  
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Esperar que carguen los comentarios
    await page.waitForTimeout(3000);
    
    // Extraer usernames de comentarios
    const comentarios = await page.evaluate(() => {
      const usernames: string[] = [];
      // Selector para comentarios de YouTube
      const elements = document.querySelectorAll('#author-text span');
      elements.forEach((el: any) => {
        const text = el.textContent?.trim();
        if (text && text.length > 0) {
          usernames.push(text);
        }
      });
      return [...new Set(usernames)];
    });
    
    return comentarios;
  } catch (error) {
    console.error('Error recolectando YouTube:', error);
    throw new Error('No se pudieron recolectar los comentarios de YouTube');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export function validarUrlYouTube(url: string): boolean {
  return /^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-]+/.test(url);
}
