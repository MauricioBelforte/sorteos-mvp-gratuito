import { Router, Request, Response } from 'express';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const router = Router();

const SESSION_PATH = path.join(process.cwd(), '.instagram-session.json');
const INFO_PATH = path.join(process.cwd(), '.instagram-session-info.json');

function sesionExiste(): boolean {
  try {
    return fs.existsSync(SESSION_PATH) && fs.existsSync(INFO_PATH);
  } catch {
    return false;
  }
}

// Login asistido: abre una ventana de Chrome para que el usuario se loguee una sola vez
router.post('/instagram/login', async (req: Request, res: Response) => {
  let browser: any = null;
  try {
    console.log('Instagram: login asistido iniciado (ventana visible)');
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Esperar a que el usuario se loguee: la página deja de estar en /accounts/ y,
    // CRÍTICO, el navegador ya tiene la cookie sessionid (login real completado).
    // Antes se guardaba apenas cambiaba la URL, capturando el "login wall" sin sessionid.
    const inicio = Date.now();
    let usuarioLogueado = '';
    while (Date.now() - inicio < 300000) {
      const cookies = await context
        .cookies('https://www.instagram.com')
        .catch(() => [] as any[]);
      const sid = cookies.find((c: any) => c.name === 'sessionid' && c.value);
      if (sid) {
        // Dar unos segundos para que Instagram asiente el resto de las cookies
        // (csrftoken, ds_user_id, rur) antes de guardar el storageState.
        await page.waitForTimeout(5000);
        break;
      }
      await page.waitForTimeout(2000);
    }

    const cookiesFinales = await context.cookies('https://www.instagram.com').catch(() => [] as any[]);
    if (!cookiesFinales.some((c: any) => c.name === 'sessionid')) {
      throw new Error('No se detectó la cookie sessionid: el login no se completó');
    }

    // Detectar el username logueado (el header muestra el perfil con imagen alt="@usuario")
    usuarioLogueado = await page
      .evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img[alt]'));
        for (const img of imgs) {
          const alt = (img as HTMLImageElement).alt || '';
          const conArroba = alt.match(/@?([a-zA-Z0-9_.]{3,30})\s*(?:profile|perfil|foto)/i);
          if (conArroba) return conArroba[1];
        }
        const links = Array.from(document.querySelectorAll('a[href^="/"]'));
        const perfil = links.find((a) => {
          const h = a.getAttribute('href') || '';
          return /^\/[a-zA-Z0-9_.]{1,30}\/?$/.test(h) && h !== '/' && (a.querySelector('img') || (a.getAttribute('aria-label') || '').toLowerCase().includes('profile'));
        });
        if (perfil) {
          const h = (perfil.getAttribute('href') || '').replace(/\//g, '').trim();
          if (h) return h;
        }
        return 'conectado';
      })
      .catch(() => 'conectado');

    // Guardar la sesión completa (incluye sessionid, cookies HttpOnly)
    await page.context().storageState({ path: SESSION_PATH });
    fs.writeFileSync(INFO_PATH, JSON.stringify({ usuario: usuarioLogueado, guardadoEn: new Date().toISOString() }));

    console.log(`Instagram: sesión guardada del usuario @${usuarioLogueado}`);
    res.json({ ok: true, usuario: usuarioLogueado });
  } catch (e: any) {
    console.error('Instagram: login asistido falló:', e.message);
    res.status(408).json({ error: 'No se completó el login a tiempo (no apareció la sesión). Cerrá la ventana y probá de nuevo.' });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        /* noop */
      }
    }
  }
});

// Cerrar sesión guardada
router.post('/instagram/logout', async (req: Request, res: Response) => {
  try {
    fs.rmSync(SESSION_PATH, { force: true });
    fs.rmSync(INFO_PATH, { force: true });
    console.log('Instagram: sesión guardada eliminada');
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Estado de la sesión guardada
router.get('/instagram/estado', async (req: Request, res: Response) => {
  try {
    if (!sesionExiste()) {
      res.json({ conectado: false });
      return;
    }
    const info = JSON.parse(fs.readFileSync(INFO_PATH, 'utf-8'));
    res.json({ conectado: true, usuario: info.usuario || '', guardadoEn: info.guardadoEn || '' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export { router, SESSION_PATH, sesionExiste };
export default router;
