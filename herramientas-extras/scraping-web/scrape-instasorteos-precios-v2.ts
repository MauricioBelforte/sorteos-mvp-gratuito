// filepath: api/scripts/scrape-instasorteos-precios-v2.ts
// Versión 2: fuerza hidratación de Angular + scroll + espera más agresiva

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const URL = 'https://instasorteos.com/prices';
const OUT_DIR = path.resolve(__dirname, '../../Logs/scraping');
const SCREENSHOT_PATH = path.join(OUT_DIR, 'instasorteos-prices-v2.png');
const JSON_PATH = path.join(OUT_DIR, 'instasorteos-prices-v2.json');

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log(`[scrape-v2] Abriendo ${URL} ...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'es-AR',
  });
  const page = await context.newPage();

  // Capturar toda respuesta JSON (precios suelen venir de un endpoint interno)
  const apiResponses: { url: string; status: number; body: string }[] = [];
  page.on('response', async (resp) => {
    try {
      const ct = resp.headers()['content-type'] || '';
      const url = resp.url();
      // Filtrar solo lo que parezca API de la app (no analytics, no lottie)
      if (
        (ct.includes('application/json') || ct.includes('text/plain')) &&
        !url.includes('googletagmanager') &&
        !url.includes('doubleclick') &&
        !url.includes('googleadservices') &&
        !url.includes('facebook.com') &&
        !url.includes('usercentrics') &&
        !url.endsWith('.json') === false || url.includes('cloudfunctions')
      ) {
        const body = await resp.text();
        apiResponses.push({ url, status: resp.status(), body });
      }
    } catch {
      // ignore
    }
  });

  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

  // Esperar a que Angular renderice algo significativo dentro de app-root
  console.log('[scrape-v2] Esperando a que Angular hidrate app-root ...');
  try {
    await page.waitForFunction(
      () => {
        const root = document.querySelector('app-root') || document.body;
        const text = (root?.textContent || '').trim();
        return text.length > 50 && text !== 'prices works!';
      },
      { timeout: 30000 },
    );
    console.log('[scrape-v2] Angular hidratado.');
  } catch (e) {
    console.log('[scrape-v2] Timeout esperando hidratación, continuamos igual.');
  }

  // Scroll completo para activar lazy-loading
  console.log('[scrape-v2] Haciendo scroll para lazy-load ...');
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let total = 0;
      const step = 400;
      const t = setInterval(() => {
        window.scrollBy(0, step);
        total += step;
        if (total >= document.body.scrollHeight + 1000) {
          clearInterval(t);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 200);
    });
  });

  // Espera adicional
  await page.waitForTimeout(3000);

  // Tomar texto visible
  const bodyText = await page.evaluate(() => document.body.innerText);
  const fullHtml = await page.content();

  // Extraer todos los textos y los nodos con clase/texto relevante
  const dump = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const items: { tag: string; cls: string; text: string }[] = [];
    for (const el of all) {
      const t = (el.textContent || '').trim();
      if (!t || t.length > 300) continue;
      if (
        /\$/.test(t) ||
        /\bARS\b/i.test(t) ||
        /\bUSD\b/i.test(t) ||
        /\bprecio\b/i.test(t) ||
        /\bplan\b/i.test(t) ||
        /\bgratis\b/i.test(t) ||
        /\bsorteo\b/i.test(t) ||
        /\bcomentario/i.test(t) ||
        /hasta\s+\d/i.test(t) ||
        /\d+\s*\$/.test(t)
      ) {
        items.push({
          tag: el.tagName.toLowerCase(),
          cls: (el as HTMLElement).className?.toString() || '',
          text: t,
        });
      }
    }
    // Dedup
    const seen = new Set<string>();
    return items.filter((r) => {
      if (seen.has(r.text)) return false;
      seen.add(r.text);
      return true;
    });
  });

  await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });

  fs.writeFileSync(
    JSON_PATH,
    JSON.stringify(
      {
        url: URL,
        fetchedAt: new Date().toISOString(),
        bodyText,
        candidates: dump,
        apiResponses: apiResponses.map((r) => ({
          url: r.url,
          status: r.status,
          body: r.body.slice(0, 3000),
        })),
      },
      null,
      2,
    ),
    'utf-8',
  );

  console.log(`\n[scrape-v2] Screenshot: ${SCREENSHOT_PATH}`);
  console.log(`[scrape-v2] JSON:       ${JSON_PATH}`);
  console.log(`\n[scrape-v2] Texto visible (${bodyText.length} chars):\n`);
  console.log(bodyText);
  console.log(`\n[scrape-v2] Candidatos a precio (${dump.length}):\n`);
  for (const c of dump) console.log(`  <${c.tag} class="${c.cls}"> ${c.text}`);
  console.log(`\n[scrape-v2] Respuestas API internas (${apiResponses.length}):`);
  for (const r of apiResponses) console.log(`  [${r.status}] ${r.url}`);

  await browser.close();
}

main().catch((err) => {
  console.error('[scrape-v2] ERROR:', err);
  process.exit(1);
});
