// filepath: api/scripts/scrape-instasorteos-precios-v4.ts
// V4: Interceptar TODO el trafico JS y forzar carga de bundles Angular para /prices

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const URL = 'https://instasorteos.com/prices';
const OUT_DIR = path.resolve(__dirname, '../../Logs/scraping');
const SCREENSHOT_PATH = path.join(OUT_DIR, 'instasorteos-prices-v4.png');
const HTML_PATH = path.join(OUT_DIR, 'instasorteos-prices-v4.html');
const JSON_PATH = path.join(OUT_DIR, 'instasorteos-prices-v4.json');

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log(`[scrape-v4] Abriendo ${URL} ...`);
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'es-AR',
  });
  const page = await context.newPage();

  const allJsRequests: string[] = [];
  page.on('request', (req) => {
    const url = req.url();
    if (url.endsWith('.js') || url.includes('chunk') || url.includes('runtime')) {
      allJsRequests.push(url);
    }
  });

  // Capturar HTML inicial y respuestas
  let initialHtml = '';
  let initialHeaders: Record<string, string> = {};

  page.on('response', async (resp) => {
    const req = resp.request();
    if (resp.url() === URL && req.resourceType() === 'document') {
      initialHtml = await resp.text();
      initialHeaders = resp.headers();
    }
  });

  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  // HTML final despues de carga
  const fullHtml = await page.content();

  // Inspeccionar el body completo, app-root, scripts
  const inspect = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script')).map((s) => ({
      src: s.src,
      type: s.type,
      hasContent: (s.textContent || '').length > 0,
      contentSnippet: (s.textContent || '').slice(0, 500),
    }));
    const appRoot = document.querySelector('app-root');
    return {
      scripts,
      appRoot: {
        innerHTML: appRoot?.innerHTML || null,
        outerHTML: appRoot?.outerHTML || null,
      },
      bodyHTML: document.body.innerHTML.slice(0, 5000),
    };
  });

  await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
  fs.writeFileSync(HTML_PATH, fullHtml, 'utf-8');
  fs.writeFileSync(
    JSON_PATH,
    JSON.stringify(
      {
        url: URL,
        fetchedAt: new Date().toISOString(),
        initialHeaders,
        initialHtmlLength: initialHtml.length,
        initialHtmlSnippet: initialHtml.slice(0, 3000),
        fullHtml,
        inspect,
        allJsRequests,
      },
      null,
      2,
    ),
    'utf-8',
  );

  console.log(`[scrape-v4] Screenshot: ${SCREENSHOT_PATH}`);
  console.log(`[scrape-v4] HTML:       ${HTML_PATH}`);
  console.log(`[scrape-v4] JSON:       ${JSON_PATH}`);
  console.log(`\n[scrape-v4] Scripts encontrados (${inspect.scripts.length}):`);
  inspect.scripts.forEach((s) => console.log(`  ${s.src || '(inline)'} (${s.hasContent ? 'contenido' : 'vacio'})`));
  console.log(`\n[scrape-v4] App-root outerHTML:`);
  console.log(inspect.appRoot.outerHTML);
  console.log(`\n[scrape-v4] HTML inicial (primeros 3000 chars):`);
  console.log(initialHtml.slice(0, 3000));
  console.log(`\n[scrape-v4] JS Requests (${allJsRequests.length}):`);
  allJsRequests.forEach((u) => console.log(`  ${u}`));

  await browser.close();
}

main().catch((err) => {
  console.error('[scrape-v4] ERROR:', err);
  process.exit(1);
});
