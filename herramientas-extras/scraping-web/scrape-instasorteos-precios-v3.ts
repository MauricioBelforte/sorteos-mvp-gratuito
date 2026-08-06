// filepath: api/scripts/scrape-instasorteos-precios-v3.ts
// V3: Forzar render de Angular + capturar errores de consola + analizar bundles JS

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const URL = 'https://instasorteos.com/prices';
const OUT_DIR = path.resolve(__dirname, '../../Logs/scraping');
const SCREENSHOT_PATH = path.join(OUT_DIR, 'instasorteos-prices-v3.png');
const JSON_PATH = path.join(OUT_DIR, 'instasorteos-prices-v3.json');

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log(`[scrape-v3] Abriendo ${URL} ...`);
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'es-AR',
  });
  const page = await context.newPage();

  const consoleLogs: string[] = [];
  const errors: string[] = [];
  page.on('console', (msg) => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', (err) => {
    errors.push(`[pageerror] ${err.message}\n${err.stack || ''}`);
  });

  // Primero vamos a la home para que se carguen los bundles iniciales
  console.log('[scrape-v3] Cargando home primero ...');
  await page.goto('https://instasorteos.com/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  console.log('[scrape-v3] Home cargada. Ahora yendo a /prices ...');

  // Ahora navegar a /prices
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

  // Esperar a que el DOM de Angular crezca más allá de "prices works!"
  try {
    await page.waitForFunction(
      () => {
        const root = document.querySelector('app-root') || document.body;
        const text = (root?.textContent || '').trim();
        return text.length > 200;
      },
      { timeout: 60000 },
    );
    console.log('[scrape-v3] Angular hidrato con contenido real.');
  } catch (e) {
    console.log('[scrape-v3] Angular NO hidrato aun. Forzando refresco de ruta...');
  }

  // Si sigue mostrando "prices works!" intentar forzar deteccion de cambios
  const stillPlaceholder = await page.evaluate(() => {
    return (document.querySelector('app-root')?.textContent || '').trim() === 'prices works!';
  });

  if (stillPlaceholder) {
    console.log('[scrape-v3] Aparentemente es un placeholder. Probando: hacer click en nav...');
    // A veces el componente <app-pricing> o <app-prices> necesita inicializarse
    // Forzar la emision de un click en un posible boton de precios
    const links = await page.$$('a[href*="prices"]');
    console.log(`[scrape-v3] Links a /prices encontrados: ${links.length}`);

    // Probar disparar navegacion via window.location hash o router
    await page.evaluate(() => {
      // Si existe el router de Angular, navegar
      const ng = (window as any).ng;
      if (ng && ng.getInjector) {
        try {
          console.log('Angular DevTools detectado');
        } catch {}
      }
    });

    // Reemplazar texto y forzar evento
    await page.evaluate(() => {
      const root = document.querySelector('app-root');
      if (root && (root.textContent || '').trim() === 'prices works!') {
        // Angular no inicializo, esperar más
        console.log('Aun placeholder');
      }
    });

    // Esperar más
    await page.waitForTimeout(15000);
  }

  // Scroll
  console.log('[scrape-v3] Scroll ...');
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let total = 0;
      const step = 400;
      const t = setInterval(() => {
        window.scrollBy(0, step);
        total += step;
        if (total >= document.body.scrollHeight + 1500) {
          clearInterval(t);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 300);
    });
  });

  await page.waitForTimeout(2000);

  const bodyText = await page.evaluate(() => document.body.innerText);
  const fullHtml = await page.content();

  await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });

  fs.writeFileSync(
    JSON_PATH,
    JSON.stringify(
      {
        url: URL,
        fetchedAt: new Date().toISOString(),
        bodyText,
        bodyTextLength: bodyText.length,
        consoleLogs: consoleLogs.slice(-100),
        errors,
      },
      null,
      2,
    ),
    'utf-8',
  );

  console.log(`\n[scrape-v3] Screenshot: ${SCREENSHOT_PATH}`);
  console.log(`[scrape-v3] JSON:       ${JSON_PATH}`);
  console.log(`\n[scrape-v3] Texto visible (${bodyText.length} chars):\n`);
  console.log(bodyText);
  console.log(`\n[scrape-v3] Errores JS (${errors.length}):`);
  errors.forEach((e) => console.log(e));
  console.log(`\n[scrape-v3] Ultimos console logs:`);
  consoleLogs.slice(-30).forEach((l) => console.log(l));

  await browser.close();
}

main().catch((err) => {
  console.error('[scrape-v3] ERROR:', err);
  process.exit(1);
});
