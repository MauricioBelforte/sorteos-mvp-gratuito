# 03 - Diseño - Optimización de RAM para la Estrategia G en Render free

## Arquitectura involucrada

```
Frontend Vercel ----(POST /api/sorteos/analizar)----> API Render (512 MB)
                                                         │
                          ┌──────────────────────────────┤
                          │                              ▼
      instagram-v2.ts (orquestador de estrategias)   POST con datos
                          │                              │
                          ▼                              ▼
   Chromium launch (channel chrome + flags RAM)      Prisma -> Supabase
                          │
                          ▼
      estrategiaScrollAnonimo (scroll + reciclado de página)
```

## Componentes a modificar

### A. `api/src/collectors/instagram-v2.ts` — Flags del navegador

Definir constante `ARGS_NAVEGADOR` (ya existe) y ampliarla:

```ts
const ARGS_NAVEGADOR = [
  '--disable-blink-features=AutomationControlled',
  '--window-size=1280,720',
  '--disable-dev-shm-usage',
  '--no-sandbox',
  '--disable-gpu',
  '--disable-extensions',
  '--disable-background-networking',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
  '--disable-ipc-flooding-protection',
  // --- Agregado para reducir RAM ---
  '--single-process',
  '--no-zygote',
  '--js-flags=--max-old-space-size=384',
  '--expose-gc',
  '--disable-software-rasterizer',
  '--disable-features=TranslateUI,VizDisplayCompositor',
];
```

> Nota: `--single-process` y `--no-zygote` consolidan procesos para reducir RAM a costa de posible inestabilidad: se validan en local antes de desplegar.

### B. `api/src/collectors/strategies/scroll-anon-completo.ts` — Reciclado de página

Nueva constante `ITERACIONES_POR_RECICLO` (default ~30). Dentro del for principal, cuando `i % ITERACIONES_POR_RECICLO === 0` y `i > 0`, invocar la misma lógica de reinicio que ya existe (cerrar página, abrir nueva, `goto`, scroll inicial), pero **sin** reiniciar el contador `sinProgreso` (no es un no-progreso, es un avance). Libera el DOM acumulado sin perder `vistos` (vive en Node).

También opcional: llamar `window.gc()` tras extraer si `--expose-gc` está activo.

### 3. `Dockerfile` — Xvfb a menor resolución

CMD actual `-screen 0 1280x1024x24` → `-screen 0 1280x720x24`. Mantener `-ac` y la espera del socket `/tmp/.X11-unix/X99`.

### 4. Observabilidad — helper `api/src/lib/memoria.ts`

```ts
import * as fs from 'node:fs';

export function memoriaContenedor(): { usadoMb: number; limiteMb: number; rssMb: number } {
  let usado = 0, limite = 0;
  try {
    limite = parseInt(fs.readFileSync('/sys/fs/cgroup/memory.max', 'utf-8').trim(), 10);
    usado = parseInt(fs.readFileSync('/sys/fs/cgroup/memory.current', 'utf-8').trim(), 10);
  } catch { /* no cgroup (local) */ }
  const rssMb = Math.round((process.memoryUsage().rss || 0) / 1024 / 1024);
  const aMb = (v: number) => (v > 0 ? Math.round(v / 1024 / 1024) : 0);
  return { usado: aMb(usado), limite: aMb(limite), rssMb };
}
```

Loguear con `console.log('MEM: { JSON }')` al inicio del scroll, cada ~10 iteraciones y al final.

## Flujo de datos (reciclado de página)

```
vistos: Map<string, Participante>   // vive en Node, persiste
  ↓ cada RECORRIDO de iteración:
     extraerParesDOM(page)  -> agregar a `vistos`
     wheel scroll -> carga siguiente tanda
     cada 30 iAps -> reciclar página:
        page.close(); page = contextoAnonimo.newPage();
        goto(url); aceptarConsentimiento(); cerrarDialogos(); bajar
  ↓ fin: return [...vistos.values()].slice(0, cantidadMaxima)
```

## Verificación (crítico: PRUEBA LOCAL primero)

1. En local Windows, con la versión optimizada, correr `POST /api/sorteos/analizar` contra el post real `C347268uDMm` (152 esperados) y comparar participantes vs baseline (2393/2399 es el techo del post grande; post chico 152).
2. Medir RSS de Node y (si hay cgroup) memoria de contenedor.
3. Recién si local es correcta y estable, desplegar a Render y medir en vivo con el log `MEM:`. Si el pico < 512 MB → éxito.