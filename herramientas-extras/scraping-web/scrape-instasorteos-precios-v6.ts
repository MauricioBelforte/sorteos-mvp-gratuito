// filepath: api/scripts/scrape-instasorteos-precios-v6.ts
// V6: Click PRECIOS desde home + capturar todo

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const OUT_DIR = path.resolve(__dirname, '../../Logs/scraping');
const SCREENSHOT_PATH = path.join(OUT_DIR, 'instasorteos-prices-v6.png');
const JSON_PATH = path.join(OUT_DIR, 'instasorteos-prices-v6.json');

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('[scrape-v6] Cargando home ...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1800 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'es-AR',
  });
  const page = await context.newPage();

  const apiCalls: any[] = [];
  page.on('response', async (resp) => {
    try {
      const url = resp.url();
      if (
        url.includes('cloudfunctions') ||
        url.includes('firestore') ||
        url.includes('firebaseio') ||
        url.includes('/api/') ||
        url.includes('getPrice') ||
        url.includes('mercadopago')
      ) {
        const ct = resp.headers()['content-type'] || '';
        const body = ct.includes('json') || ct.includes('text') ? await resp.text() : '';
        apiCalls.push({ url, body: body.slice(0, 5000), status: resp.status() });
      }
    } catch {}
  });

  // 1. Cargar home con domcontentloaded (más rápido, sin esperar networkidle)
  await page.goto('https://instasorteos.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  // 2. Click en PRECIOS
  console.log('[scrape-v6] Click en PRECIOS ...');
  const precioBtn = page.locator('a:has-text("PRECIOS"), button:has-text("PRECIOS")').first();
  await precioBtn.click();
  await page.waitForTimeout(8000);

  // 3. Capturar pantalla y texto
  const bodyText = await page.evaluate(() => document.body.innerText);
  const url = page.url();
  console.log(`[scrape-v6] URL actual: ${url}`);
  console.log(`[scrape-v6] Texto visible (${bodyText.length} chars):`);
  console.log(bodyText);

  await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
  fs.writeFileSync(
    JSON_PATH,
    JSON.stringify(
      {
        fetchedAt: new Date().toISOString(),
        url,
        bodyText,
        apiCalls,
      },
      null,
      2,
    ),
    'utf-8',
  );

  console.log(`\n[scrape-v6] Screenshot: ${SCREENSHOT_PATH}`);
  console.log(`[scrape-v6] JSON: ${JSON_PATH}`);

  await browser.close();
}

main().catch((err) => {
  console.error('[scrape-v6] ERROR:', err);
  // Persistir el error y screenshot
  try {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(
      JSON_PATH,
      JSON.stringify({ error: String(err), stack: err.stack }, null, 2),
      'utf-8',
    );
  } catch {}
  process.exit(1);
});
