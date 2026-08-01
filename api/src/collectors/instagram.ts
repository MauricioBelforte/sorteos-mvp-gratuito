import { chromium, Browser, Page } from 'playwright';

export async function recolectarInstagram(url: string): Promise<string[]> {
  let browser: Browser | null = null;
  
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Esperar que carguen los comentarios
    await page.waitForTimeout(2000);
    
    // Extraer usernames de comentarios
    const comentarios = await page.evaluate(() => {
      const usernames: string[] = [];
      // Selector para comentarios de Instagram
      const elements = document.querySelectorAll('[data-visualcompletion="ignore-dynamic"] span');
      elements.forEach((el: any) => {
        const text = el.textContent?.trim();
        if (text && !text.includes('Me gusta') && !text.includes('comentar') && text.length > 0 && text.length < 50) {
          usernames.push(text);
        }
      });
      return [...new Set(usernames)];
    });
    
    return comentarios;
  } catch (error) {
    console.error('Error recolectando Instagram:', error);
    throw new Error('No se pudieron recolectar los comentarios de Instagram');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export function validarUrlInstagram(url: string): boolean {
  return /^https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel)\/[a-zA-Z0-9_-]+/.test(url);
}
