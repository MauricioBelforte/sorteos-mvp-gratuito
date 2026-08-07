# Módulo 10: Optimización de RAM en Render (Plan Free 512 MB)
## Especificación de Código - Solución Gemini 3.6

**Modelo:** Gemini 3.6  
**Fecha:** 2026-08-07  
**Estado:** Plan Actual - Especificación de Código  

---

## 1. Archivos Involucrados en la Solución

| Archivo | Acción | Propósito |
| :--- | :--- | :--- |
| `api/src/collectors/strategies/scroll-anon-gzero.ts` | **[NUEVO]** | Estrategia G-Zero: Intercepción de red streaming, DOM Wiping en vivo y RAM Governor dinámico. |
| `api/src/collectors/instagram-v2.ts` | **[MODIFICAR]** | Integrar `estrategiaScrollGZero` y aplicar perfil de banderas `ARGS_NAVEGADOR_GZERO`. |
| `api/src/lib/memoria.ts` | **[MODIFICAR]** | Agregar función helper `forzarGarbageCollection()` para Node.js. |
| `Dockerfile` | **[MODIFICAR]** | Configurar `NODE_OPTIONS=--max-old-space-size=160` e instanciar headless de bajo consumo. |

---

## 2. Pseudocódigo y Estructura Principal (`scroll-anon-gzero.ts`)

```typescript
import { Page, BrowserContext } from 'playwright';
import { Participante } from '../types';
import { ContextoScraping } from './types';
import { logMemoria, memoriaContenedor, forzarGarbageCollection } from '../../lib/memoria';

/**
 * Estrategia G-Zero (Gemini 3.6): Scroll Anónimo Ultra-Lean
 * Diseñada específicamente para no superar 350 MB de RAM en Render Free (512 MB).
 */
export async function estrategiaScrollGZero(ctx: ContextoScraping): Promise<Participante[]> {
  const { url, autorExcluido, cantidadMaxima, cantidadEsperada } = ctx;
  const vistos = new Map<string, Participante>();
  let page = ctx.page;

  logMemoria('G-Zero: Inicio de recolección ultra-lean');

  // 1. Configurar Interceptor de Red para capturar comentarios en vuelo
  await page.on('response', async (response) => {
    const reqUrl = response.url();
    if (reqUrl.includes('/graphql/query') || reqUrl.includes('/comments/') || reqUrl.includes('/api/v1/media/')) {
      try {
        const json = await response.json();
        const extraidos = extraerComentariosDeJSON(json, autorExcluido);
        for (const p of extraidos) {
          const clave = `${p.usuario.toLowerCase()}|${p.comentario}`;
          if (!vistos.has(clave)) vistos.set(clave, p);
        }
      } catch {
        /* Ignorar respuestas no JSON o fallos de parseo */
      }
    }
  });

  // 2. Loop de Scroll con DOM Wiping y RAM Governor
  const iteraciones = cantidadEsperada ? Math.min(300, Math.max(40, Math.ceil(cantidadEsperada / 15))) : 50;

  for (let i = 0; i < iteraciones; i++) {
    // A) Scroll real con mouse
    await page.mouse.move(600, 350).catch(() => {});
    await page.mouse.wheel(0, 2200).catch(() => {});
    await page.waitForTimeout(1200 + Math.random() * 500);

    // B) DOM Wiping (Vaciar contenedor HTML para mantener Renderer en ~20 MB)
    if (i % 2 === 0) {
      await page.evaluate(() => {
        const uls = document.querySelectorAll('ul');
        uls.forEach((ul) => {
          if (ul.children.length > 8) {
            ul.innerHTML = ''; // Vacía el DOM de comentarios en el navegador
          }
        });
      }).catch(() => {});
    }

    // C) Monitoreo con Dynamic RAM Governor
    const mem = memoriaContenedor();
    if (mem.limiteMb > 0 && mem.usadoMb / mem.limiteMb >= 0.75) {
      console.warn(`MEM ALERTA: Consumo en ${mem.usadoMb} MB (${Math.round((mem.usadoMb / mem.limiteMb) * 100)}%). Ejecutando Hot Tab Recycle...`);
      
      // Hot Tab Recycle & GC
      await page.close().catch(() => {});
      forzarGarbageCollection(); // Dispara V8 GC en Node.js
      
      const context = page.context();
      page = await context.newPage();
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(2000);
    }

    if (vistos.size >= cantidadMaxima) break;
  }

  logMemoria(`G-Zero: Fin de recolección (${vistos.size} únicos)`);
  forzarGarbageCollection();
  
  return Array.from(vistos.values()).slice(0, cantidadMaxima);
}

function extraerComentariosDeJSON(data: any, autorExcluido?: string): Participante[] {
  const lista: Participante[] = [];
  try {
    const stringified = JSON.stringify(data);
    // Regex o traverser para buscar nodos { text, owner: { username } }
    // Implementación robusta de extracción JSON
  } catch { /* noop */ }
  return lista;
}
```

---

## 3. Ajustes en `Dockerfile`

```dockerfile
# Reducción drástica de Heap en Node.js para dejar más de 300 MB libres en el contenedor
ENV NODE_OPTIONS=--max-old-space-size=160
```

---

## 4. Modificaciones en `memoria.ts`

```typescript
export function forzarGarbageCollection(): void {
  if (global.gc) {
    try {
      global.gc();
      console.log('MEM: Garbage collection manual ejecutado en Node.js');
    } catch {
      /* noop */
    }
  }
}
```
