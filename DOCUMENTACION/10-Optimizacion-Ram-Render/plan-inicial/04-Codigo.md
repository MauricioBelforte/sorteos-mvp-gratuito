# 04 - Código - Optimización de RAM para la Estrategia G en Render free

## Archivos involucrados

| Archivo | Rol actual | Cambio de optimización |
|---|---|---|
| `api/src/collectors/instagram-v2.ts` | Orquestador de estrategias; `ARGS_NAVEGADOR` (líneas 25-37); lanzamiento en líneas 95-97 | Ampliar `ARGS_NAVEGADOR` con flags de reducción de RAM + viewport 720p |
| `api/src/collectors/strategies/scroll-anon-completo.ts` | Estrategia G; ciclo de scroll (líneas 168-242); reinicios (`page.close()` + `newPage()`) en líneas 188-216 | Reciclado periódico de página cada N iteraciones reusando la lógica existente |
| `api/src/collectors/instagram.ts` | Helpers `extraerParesDOM`, `aceptarConsentimiento` | (sin cambios; quizá invocar `window.gc()`), documentado |
| `Dockerfile` | Xvfb (línea 38) `-screen 0 1280x1024x24`; `NODE_OPTIONS=...384` (línea 12) | Xvfb a `1280x720x24`; revisar flags de arranque |
| `api/src/lib/memoria.ts` | (nuevo) | Helper de medición de memoria del contenedor (cgroup + RSS) |

## Funciones clave actuales

### `ARGS_NAVEGADOR` — `api/src/collectors/instagram-v2.ts:25`

Flags actuales (bajo consumo): `--disable-blink-features`, `--window-size=1280,900`, `--disable-dev-shm-usage`, `--no-sandbox`, `--disable-gpu`, `--disable-extensions`, `--disable-background-networking`, `--disable-background-timer-throttling`, `--disable-backgrounding-occluded-windows`, `--disable-renderer-backgrounding`, `--disable-ipc-flooding-protection`.

**A agregar (objetivo RAM):** `--single-process`, `--no-zygote`, `--js-flags=--max-old-space-size=384`, `--expose-gc`, `--disable-software-rasterizer`, `--disable-features=TranslateUI,VizDisplayCompositor`. Viewport → `1280,720`.

### `estrategiaScrollAnonimo` (`scroll-anon-completo.ts:43`)

- `vistos: Map<string, Participante>` (línea 45): vive en Node, NO en el DOM → el reciclado de página no pierde datos.
- Ciclo de scroll (líneas 168-242): extrae pares DOM → scroll por `mouse.wheel` sobre la columna (x=1000) → cierra login wall si reaparece.
- Reinicio por sin-progreso (líneas 188-216): si contexto anónimo → `page.close()` + `contextoAnonimo.newPage()` + `goto` (libera memora); si no → `page.reload()` (NO libera igual pero es respaldo).
- `iteraciones` dinámicas (líneas 159-161): `Math.min(300, Math.max(40, ceil(cantidadEsperada/15)))`.
- `reiniciosMaximos = 3` (línea 166).

### `Dockerfile` CMD (línea 38)

`Xvfb :99 -screen 0 1280x1024x24 -ac` + espera del socket `/tmp/.X11-unix/X99` + `exec node dist/index.js`.

## Funciones nuevas previstas

### N° 1 — `memoriaContenedor()` (nuevo `api/src/lib/memoria.ts`)

```ts
import * as fs from 'node:fs';
export function memoriaContenedor() {
  let usado = 0, limite = 0;
  try {
    limite = parseInt(fs.readFileSync('/sys/fs/cgroup/memory.max', 'utf-8').trim(), 10);
    usado = parseInt(fs.readFileSync('/sys/fs/cgroup/memory.current', 'utf-8').trim(), 10);
  } catch { /* sin cgroup (local) */ }
  const rssMb = Math.round((process.memoryUsage().rss || 0) / 1024 / 1024);
  const aMb = (v: number) => (v > 0 ? Math.round(v / 1024 / 1024) : 0);
  return { usadoMb: aMb(usado), limiteMb: aMb(limite), rssMb };
}
// Uso: console.log('MEM:', JSON.stringify(memoriaContenedor()))
```

### N° 2 — Reciclado periódico de página en `estrategiaScrollAnonimo`

```ts
const ITERACIONES_POR_RECICLO = 30;
// dentro del for:
if (i > 0 && i % ITERACIONES_POR_RECICLO === 0) {
  // cerrar página y abrir nueva (reusa bloque de reinicio de líneas 194-216)
  // PERO sin tocar sinProgreso/rebotado (es avance, no no-progreso)
}
```

## Logs relacionados (histórico)

- `Logs/42-...` — Fix Chrome real + Xvfb en Render (deploy `9af19c4`..`c3b29a5`).
- `Logs/43-...` — OOM en free tier verificado en vivo (`Instance failed ... out of memory (used over 512MB)`).
- `DOCUMENTACION/06-Mejoras-Backend-Produccion/plan-actual/05-Checklist.md` — decisión 43 registrada.