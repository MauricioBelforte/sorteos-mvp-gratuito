# 04 - Código — Propuesta Composer 2.5 (Estrategia G-Lite)

**Modelo:** Composer 2.5  
**Fecha:** 2026-08-07  
**Responde a:** `Mensajes entre modelos/08-Optimizacion-RAM-Render/2026-08-07_17-24-14_1-DEEPSEEK-planteo.md`

---

## 1. Mapa de archivos

| Archivo | Acción | Rol |
|---------|--------|-----|
| `api/src/collectors/strategies/scroll-anon-graphql.ts` | **CREAR** | Handler G-Lite (GraphQL-first + poda + reciclado adaptativo) |
| `api/src/collectors/strategies/lib/podar-dom.ts` | **CREAR** | Helper poda DOM post-captura |
| `api/src/collectors/strategies/scroll-anon-completo.ts` | **NO TOCAR** | G clásica estable |
| `api/src/collectors/instagram-v2.ts` | **MODIFICAR** | Selector G vs G-Lite + tier Chrome + flags lite |
| `api/src/lib/memoria.ts` | **MODIFICAR** | `porcentaje`, `margenMb`, `debeReciclarPorMemoria()` |
| `api/src/collectors/strategies/graphql-intercept.ts` | **REUTILIZAR** | Export `extraerComentariosDeGraphQL` (ya existe) |
| `Dockerfile` | **MODIFICAR** | `NODE_OPTIONS=256`, `RENDER=true`, `SCRAPER_MODE=glite` |
| `render.yaml` o env Render | **MODIFICAR** | Variables tier opcionales |

---

## 2. Archivos existentes relevantes (baseline)

### `scroll-anon-completo.ts` — patrones a reutilizar

| Función/bloque | Líneas aprox. | Reutilizar en G-Lite |
|----------------|---------------|----------------------|
| `bloquearRecursosPesados()` | 50–66 | ✅ Copiar/importar |
| Contexto anónimo si hay sesión | 72–96 | ✅ Igual |
| `cerrarDialogos()` | 137–165 | ✅ Igual |
| `recargarPagina()` | 211–234 | ✅ Igual + re-bind GraphQL listener |
| Loop scroll wheel | 236–301 | ✅ Igual |
| `ITERACIONES_POR_RECICLO = 40` | 205 | ⚠️ Cambiar a 8 en G-Lite |

### `instagram-v2.ts` — selección navegador actual

```110:133:api/src/collectors/instagram-v2.ts
    const modoChrome = (process.env.CHROME_MODE || '').toLowerCase();
    const usaLightChromium = modoChrome === 'chromium';
    const fuerzaHeadless = modoChrome === 'headless';
    const headless = !!cookieStr || fuerzaHeadless || usaLightChromium;
    const launchOptions = usaLightChromium
      ? { headless: true, args: ARGS_NAVEGADOR }
      : headless
      ? { headless: true, channel: 'chrome', args: ARGS_NAVEGADOR }
      : { headless: false, channel: 'chrome', args: ARGS_NAVEGADOR };
```

### `memoria.ts` — baseline

```13:30:api/src/lib/memoria.ts
export function memoriaContenedor(): MedicionMemoria {
  // lee cgroup memory.current / memory.max
  // retorna usadoMb, limiteMb, rssMb
}
export function logMemoria(etiqueta: string): void { ... }
```

---

## 3. Código propuesto — `scroll-anon-graphql.ts`

```typescript
import { Participante } from '../types';
import { ContextoScraping } from './types';
import { aceptarConsentimiento } from '../instagram';
import { extraerComentariosDeGraphQL } from './graphql-intercept';
import { logMemoria, debeReciclarPorMemoria } from '../../lib/memoria';
import { podarDomCapturado } from './lib/podar-dom';
// Importar bloquearRecursosPesados desde scroll-anon-completo o extraer a lib compartida

const RECICLO_ITER = parseInt(process.env.RECICLO_ITER || (process.env.RENDER ? '8' : '40'), 10);
const RECICLO_MAX = parseInt(process.env.RECICLO_MAX || '12', 10);

export async function estrategiaScrollAnonimoGraphQL(ctx: ContextoScraping): Promise<Participante[]> {
  const { url, autorExcluido, cantidadMaxima, cantidadEsperada } = ctx;
  const vistos = new Map<string, Participante>();
  let sinProgresoGraphQL = 0;
  let reciclados = 0;

  // ... setup contexto anónimo (igual G clásica) ...

  const agregar = (pares: Participante[]): number => {
    let nuevos = 0;
    for (const p of pares) {
      const clave = `${p.usuario.toLowerCase()}|${p.comentario.trim()}`;
      if (!vistos.has(clave)) {
        vistos.set(clave, p);
        nuevos++;
      }
    }
    return nuevos;
  };

  const onResponse = async (response: import('playwright').Response) => {
    const u = response.url();
    if (!u.includes('/graphql')) return;
    try {
      const ct = response.headers()['content-type'] || '';
      if (!ct.includes('json')) return;
      const data = await response.json();
      const comentarios = extraerComentariosDeGraphQL(data, autorExcluido);
      if (comentarios.length > 0) {
        const nuevos = agregar(comentarios);
        if (nuevos > 0) sinProgresoGraphQL = 0;
      }
    } catch { /* body consumido */ }
  };

  const bindGraphQL = (p: import('playwright').Page) => {
    p.on('response', onResponse);
  };

  bindGraphQL(page);
  logMemoria('G-Lite inicio');

  const iteraciones = cantidadEsperada
    ? Math.min(300, Math.max(40, Math.ceil(cantidadEsperada / 15)))
    : 40;

  for (let i = 0; i < iteraciones; i++) {
    const antes = vistos.size;

    // Fallback DOM solo si GraphQL estancado
    if (sinProgresoGraphQL >= 2) {
      const { extraerParesDOM } = await import('../instagram');
      agregar(await extraerParesDOM(page, autorExcluido));
    }

    if (vistos.size === antes) sinProgresoGraphQL++;
    else sinProgresoGraphQL = 0;

    // Poda DOM
    await podarDomCapturado(page, new Set(vistos.keys())).catch(() => {});

    // Reciclado adaptativo
    const reciclar =
      (i > 0 && i % RECICLO_ITER === 0 && reciclados < RECICLO_MAX) ||
      debeReciclarPorMemoria(parseFloat(process.env.RECICLO_MEM_UMBRAL || '0.85'));

    if (reciclar) {
      reciclados++;
      await recargarPagina(/* ... */);
      bindGraphQL(page);
      logMemoria(`G-Lite post-reciclado ${reciclados}`);
      continue;
    }

    if (vistos.size >= cantidadMaxima) break;

    // Scroll (igual G clásica)
    await page.mouse.move(1000, 450).catch(() => {});
    await page.mouse.wheel(0, 2200).catch(() => {});
    await page.waitForTimeout(1400 + Math.random() * 800);

    await page.evaluate(() => (window as any).gc?.()).catch(() => {});

    if (i % 5 === 0) logMemoria(`G-Lite iter-${i} (${vistos.size} capturados)`);
  }

  logMemoria(`G-Lite fin (${vistos.size} capturados)`);
  return [...vistos.values()].slice(0, cantidadMaxima);
}
```

---

## 4. Código propuesto — `podar-dom.ts`

```typescript
import type { Page } from 'playwright';

export async function podarDomCapturado(page: Page, claves: Set<string>): Promise<number> {
  if (claves.size === 0) return 0;
  const usuariosCapturados = [...claves].map((k) => k.split('|')[0]);
  return page.evaluate((users) => {
    let n = 0;
    const items = document.querySelectorAll('ul ul > li, div[role="dialog"] ul > li');
    for (const item of items) {
      const a = item.querySelector('a[href^="/"]');
      const u = (a?.textContent || '').trim().toLowerCase();
      if (u && users.includes(u)) {
        item.remove();
        n++;
      }
    }
    return n;
  }, usuariosCapturados);
}
```

---

## 5. Código propuesto — cambios en `instagram-v2.ts`

```typescript
import { estrategiaScrollAnonimo } from './strategies/scroll-anon-completo';
import { estrategiaScrollAnonimoGraphQL } from './strategies/scroll-anon-graphql';

function usarGLite(): boolean {
  return process.env.SCRAPER_MODE === 'glite' || process.env.RENDER === 'true';
}

function resolverModoChrome(cantidadEsperada: number | null): string {
  const override = (process.env.CHROME_MODE || '').toLowerCase();
  if (override) return override;
  if (process.env.RENDER !== 'true') return '';
  if (!cantidadEsperada || cantidadEsperada <= 300) return 'chromium';
  return 'headless';
}

// Después de obtener cantidadEsperada:
const modoAuto = resolverModoChrome(cantidadEsperada);
if (modoAuto && !process.env.CHROME_MODE) {
  process.env.CHROME_MODE = modoAuto;
}

const fnScroll = usarGLite() ? estrategiaScrollAnonimoGraphQL : estrategiaScrollAnonimo;

// En estrategias sin sesión:
{ nombre: usarGLite() ? 'Scroll anónimo G-Lite' : 'Scroll anónimo completo', fn: fnScroll }
```

---

## 6. Código propuesto — extensión `memoria.ts`

```typescript
export function memoriaContenedor(): MedicionMemoria {
  // ... existente ...
  const porcentaje = limiteMb > 0 ? Math.round((usadoMb / limiteMb) * 100) : 0;
  const margenMb = limiteMb > 0 ? limiteMb - usadoMb : 0;
  return { usadoMb, limiteMb, rssMb, porcentaje, margenMb };
}

export function debeReciclarPorMemoria(umbral = 0.85): boolean {
  const m = memoriaContenedor();
  return m.limiteMb > 0 && m.usadoMb >= m.limiteMb * umbral;
}
```

---

## 7. Código propuesto — `Dockerfile`

```dockerfile
# Antes: ENV NODE_OPTIONS=--max-old-space-size=384
ENV NODE_OPTIONS=--max-old-space-size=256
ENV RENDER=true
ENV SCRAPER_MODE=glite
ENV RECICLO_ITER=8
ENV RECICLO_MEM_UMBRAL=0.85
```

---

## 8. Variables de entorno

| Variable | Valores | Descripción |
|----------|---------|-------------|
| `SCRAPER_MODE` | `glite` \| (vacío) | Fuerza G-Lite incluso fuera de Render |
| `RENDER` | `true` | Auto-detect nube (Render lo setea) |
| `CHROME_MODE` | `chromium` \| `headless` \| (vacío) | Override manual; vacío = auto-tier |
| `RECICLO_ITER` | número | Iteraciones entre reciclados (default 8 nube) |
| `RECICLO_MEM_UMBRAL` | 0.0–1.0 | % cgroup para reciclado forzado |
| `RECICLO_MAX` | número | Máximo reciclados por request |
| `BLOCK_STYLES` | `1` | Bloquear CSS (experimental) |
| `DOM_PRUNE` | `0` | Desactivar poda DOM |

---

## 9. Logs esperados

```
Instagram V2: Iniciando scraping ... (sin sesión, Chromium embebido headless (CHROME_MODE=chromium))
Instagram V2: intentando Scroll anónimo G-Lite...
MEM: G-Lite inicio {"usadoMb":420,"limiteMb":512,"rssMb":95,"porcentaje":82,"margenMb":92}
MEM: G-Lite iter-5 (87 capturados) {"usadoMb":445,"limiteMb":512,...}
Instagram V2 [G-Lite]: reciclado de página 1/12 en iteración 8 (102 capturados)
MEM: G-Lite post-reciclado 1 {"usadoMb":430,"limiteMb":512,...}
MEM: G-Lite fin (144 capturados) {"usadoMb":448,"limiteMb":512,...}
Instagram V2: Scroll anónimo G-Lite -> 144 participantes
Instagram V2: Scroll anónimo G-Lite cumple el umbral (144/152)
```

---

## 10. Plan de extracción de `bloquearRecursosPesados`

Para evitar duplicación, mover a:

```
api/src/collectors/strategies/lib/bloquear-recursos.ts
```

Exportar desde ahí; importar en G clásica y G-Lite. **Cambio mínimo en G clásica** (solo import path) — evaluar si conviene en fase de implementación o copiar inline en G-Lite primero (cero riesgo en G).

---

## 11. Orden de implementación sugerido

1. Extender `memoria.ts` (sin riesgo).
2. Crear `podar-dom.ts` + tests unitarios del evaluate (mock page).
3. Crear `scroll-anon-graphql.ts` completo.
4. Wire en `instagram-v2.ts` con feature flag `SCRAPER_MODE=glite`.
5. Probar local con `SCRAPER_MODE=glite` + post chico.
6. Ajustar Dockerfile (heap 256).
7. Deploy Render + medir logs MEM.
8. Si OK → documentar en `plan-actual/`.
