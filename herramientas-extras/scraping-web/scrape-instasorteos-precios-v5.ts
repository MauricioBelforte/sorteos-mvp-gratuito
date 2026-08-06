// filepath: api/scripts/scrape-instasorteos-precios-v5.ts
// V5: Navegar desde la home, hacer click en el boton PRECIOS y capturar el slider

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const OUT_DIR = path.resolve(__dirname, '../../Logs/scraping');
const SCREENSHOT_PATH = path.join(OUT_DIR, 'instasorteos-prices-v5.png');
const JSON_PATH = path.join(OUT_DIR, 'instasorteos-prices-v5.json');

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('[scrape-v5] Cargando home ...');
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

  // Capturar respuestas API
  const apiCalls: { url: string; body: string; status: number }[] = [];
  page.on('response', async (resp) => {
    try {
      const url = resp.url();
      if (
        url.includes('cloudfunctions') ||
        url.includes('firestore') ||
        url.includes('firebaseio') ||
        url.includes('functions/v1') ||
        url.includes('getPrice') ||
        url.includes('getPlan') ||
        url.includes('/api/')
      ) {
        const ct = resp.headers()['content-type'] || '';
        const body = ct.includes('json') ? await resp.text() : '';
        apiCalls.push({ url, body: body.slice(0, 5000), status: resp.status() });
      }
    } catch {}
  });

  await page.goto('https://instasorteos.com/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);

  // Buscar el boton PRECIOS y hacer click
  console.log('[scrape-v5] Buscando boton PRECIOS ...');
  const precioBtns = await page.$$('a, button');
  let clicked = false;
  for (const btn of precioBtns) {
    const text = (await btn.textContent())?.trim().toUpperCase() || '';
    const href = (await btn.getAttribute('href')) || '';
    if (text.includes('PRECIO') || href.includes('price')) {
      console.log(`[scrape-v5] Boton encontrado: "${text}" href="${href}"`);
      try {
        await btn.click();
        clicked = true;
        await page.waitForTimeout(4000);
        break;
      } catch (e) {
        console.log(`[scrape-v5] No se pudo clickear: ${e}`);
      }
    }
  }

  // Si no clickeamos, navegar a /prices
  if (!clicked) {
    console.log('[scrape-v5] No se encontro boton. Navegando a /prices directamente ...');
    await page.goto('https://instasorteos.com/prices', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(4000);
  }

  // Tambien: probar el slider en la home (Hasta 500 comentarios / GRATIS / etc)
  console.log('[scrape-v5] Volviendo a la home para probar el slider ...');
  await page.goto('https://instasorteos.com/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);

  // Buscar inputs tipo range o slider
  const sliderSelectors = ['input[type=range]', '[role=slider]', 'mat-slider', '.mat-slider', 'ng5-slider'];
  for (const sel of sliderSelectors) {
    const count = await page.locator(sel).count();
    if (count > 0) {
      console.log(`[scrape-v5] Slider encontrado: ${sel} (${count})`);
      // Mover el slider a varios valores
      const slider = page.locator(sel).first();
      try {
        const box = await slider.boundingBox();
        if (box) {
          for (const pct of [0.1, 0.25, 0.5, 0.75, 0.95]) {
            await page.mouse.move(box.x + box.width * pct, box.y + box.height / 2);
            await page.mouse.down();
            await page.mouse.up();
            await page.waitForTimeout(1500);
            const txt = await page.evaluate(() => document.body.innerText);
            console.log(`[scrape-v5] Slider en ${(pct * 100).toFixed(0)}% - text excerpt:`);
            console.log(txt.slice(0, 800));
            console.log('---');
          }
        }
      } catch (e) {
        console.log(`[scrape-v5] No se pudo mover slider: ${e}`);
      }
      break;
    }
  }

  // Capturar el contenido del home en busca de elementos con $
  const priceText = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const out: { tag: string; cls: string; text: string }[] = [];
    for (const el of all) {
      const t = (el.textContent || '').trim();
      if (!t || t.length > 200) continue;
      if (/\$/.test(t) && (/\d/.test(t) || /precio|cuesta|ARS/i.test(t))) {
        out.push({
          tag: el.tagName.toLowerCase(),
          cls: (el as HTMLElement).className?.toString() || '',
          text: t,
        });
      }
    }
    const seen = new Set<string>();
    return out.filter((r) => {
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
        fetchedAt: new Date().toISOString(),
        clicked,
        apiCalls,
        priceText,
        currentUrl: page.url(),
        bodyText: await page.evaluate(() => document.body.innerText),
      },
      null,
      2,
    ),
    'utf-8',
  );

  console.log(`\n[scrape-v5] Screenshot: ${SCREENSHOT_PATH}`);
  console.log(`[scrape-v5] JSON: ${JSON_PATH}`);
  console.log(`\n[scrape-v5] Texto con $ (${priceText.length}):`);
  for (const p of priceText) console.log(`  <${p.tag}> ${p.text}`);
  console.log(`\n[scrape-v5] API calls capturadas (${apiCalls.length}):`);
  for (const a of apiCalls) console.log(`  [${a.status}] ${a.url}`);

  await browser.close();
}

main().catch((err) => {
  console.error('[scrape-v5] ERROR:', err);
  process.exit(1);
});
