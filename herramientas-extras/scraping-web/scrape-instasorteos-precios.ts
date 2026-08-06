// filepath: api/scripts/scrape-instasorteos-precios.ts
// Script de scraping para extraer los precios de instasorteos.com/prices
// Ejecutar con: cd api && npx tsx scripts/scrape-instasorteos-precios.ts

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const URL = 'https://instasorteos.com/prices';
const OUT_DIR = path.resolve(__dirname, '../../Logs/scraping');
const SCREENSHOT_PATH = path.join(OUT_DIR, 'instasorteos-prices.png');
const HTML_PATH = path.join(OUT_DIR, 'instasorteos-prices.html');
const JSON_PATH = path.join(OUT_DIR, 'instasorteos-prices.json');

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log(`[scrape] Abriendo ${URL} ...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1800 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'es-AR',
  });
  const page = await context.newPage();

  // Capturar respuestas de la API de Angular por si los precios vienen de un endpoint
  const apiResponses: { url: string; status: number; body: string }[] = [];
  page.on('response', async (resp) => {
    try {
      const ct = resp.headers()['content-type'] || '';
      if (ct.includes('application/json') || ct.includes('text/plain')) {
        const body = await resp.text();
        apiResponses.push({ url: resp.url(), status: resp.status(), body });
      }
    } catch {
      // ignorar
    }
  });

  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });

  // Esperar a que Angular hidrate. Probar varios selectores comunes de tarjetas de precio.
  const priceCardSelectors = [
    '.price-card',
    '.plan',
    '.pricing-card',
    '[class*="price"]',
    '[class*="plan"]',
    '[class*="pricing"]',
    'app-pricing',
    'app-price',
  ];

  let found = false;
  for (const sel of priceCardSelectors) {
    try {
      await page.waitForSelector(sel, { timeout: 5000 });
      console.log(`[scrape] Selector detectado: ${sel}`);
      found = true;
      break;
    } catch {
      // seguir
    }
  }

  // Pequeño delay adicional por si hay animaciones
  await page.waitForTimeout(2500);

  // Extraer texto visible completo
  const bodyText = await page.evaluate(() => document.body.innerText);
  const fullHtml = await page.content();

  // Extraer elementos candidatos a "precio" (texto que contenga $ o ARS o números con moneda)
  const priceCandidates = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const results: { tag: string; cls: string; text: string }[] = [];
    for (const el of all) {
      const t = (el.textContent || '').trim();
      if (!t || t.length > 200) continue;
      // Heurísticas: contiene $, ARS, "precio", "plan", "gratis", números
      if (
        /\$/.test(t) ||
        /\bARS\b/i.test(t) ||
        /\bprecio\b/i.test(t) ||
        /\bplan\b/i.test(t) ||
        /\bgratis\b/i.test(t) ||
        /\bsorteos?\b/i.test(t)
      ) {
        const cls = (el as HTMLElement).className?.toString() || '';
        results.push({
          tag: el.tagName.toLowerCase(),
          cls,
          text: t,
        });
      }
    }
    // Dedup
    const seen = new Set<string>();
    return results.filter((r) => {
      if (seen.has(r.text)) return false;
      seen.add(r.text);
      return true;
    });
  });

  // Screenshot full-page
  await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });

  // Persistir HTML y JSON
  fs.writeFileSync(HTML_PATH, fullHtml, 'utf-8');
  fs.writeFileSync(
    JSON_PATH,
    JSON.stringify(
      {
        url: URL,
        fetchedAt: new Date().toISOString(),
        bodyText,
        priceCandidates,
        apiResponses: apiResponses.map((r) => ({
          url: r.url,
          status: r.status,
        })), // solo URLs, los bodies pueden ser largos
        apiBodiesSample: apiResponses.map((r) => ({
          url: r.url,
          bodyPreview: r.body.slice(0, 500),
        })),
      },
      null,
      2,
    ),
    'utf-8',
  );

  console.log(`[scrape] Screenshot: ${SCREENSHOT_PATH}`);
  console.log(`[scrape] HTML:       ${HTML_PATH}`);
  console.log(`[scrape] JSON:       ${JSON_PATH}`);
  console.log(`[scrape] Texto visible (primeros 1500 chars):\n`);
  console.log(bodyText.slice(0, 1500));
  console.log(`\n[scrape] Candidatos a precio (${priceCandidates.length}):\n`);
  for (const c of priceCandidates) {
    console.log(`  <${c.tag} class="${c.cls}"> ${c.text}`);
  }
  console.log(`\n[scrape] Respuestas JSON/API capturadas (${apiResponses.length}):`);
  for (const r of apiResponses) {
    console.log(`  [${r.status}] ${r.url}`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error('[scrape] ERROR:', err);
  process.exit(1);
});
