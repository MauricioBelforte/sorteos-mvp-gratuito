# 03 - Diseño - Módulo de Mejoras UI

## Arquitectura

```
┌─────────────────────────── FRONTEND (web/) ───────────────────────────┐
│  app/page.tsx                                                          │
│    └── features/SorteoWizard.tsx  (flujo nuevo premium)                │
│          ├── Paso 1: Input URL + botón "Analizar publicación"          │
│          │     → web/lib/sorteos.ts: analizarPublicacion(url)          │
│          ├── Paso 2: Preview                                         │
│          │     ├── imagen del sorteo (img con fallback)                │
│          │     ├── "Cantidad de comentarios: N" (contador con badge)   │
│          │     ├── Selector "Cantidad de Ganadores" (1-10)             │
│          │     ├── Selector "¿Cuántos suplentes?" (0-10)               │
│          │     └── Botón "Sortear" (con loading state)                 │
│          │     → web/lib/sorteos.ts: crearSorteo(config)               │
│          ├── features/RuletaGanadores.tsx  (animación slot machine)    │
│          └── features/ResultCard.tsx  (multi-ganadores + suplentes)    │
└───────────────────────────────────────────────────────────────────────┘

┌─────────────────────────── BACKEND (api/) ────────────────────────────┐
│  routes/preview.ts  (NUEVO - no toca routes/sorteos.ts)                │
│    POST /api/sorteos/analizar                                          │
│      body: { urlPublicacion, redSocial }                               │
│      → lib/preview.ts: extraerImagenPublicacion(url, redSocial)        │
│      → collectors: recolectarComentarios(url, redSocial)               │
│      → resp: { cantidadComentarios, participantes, imagen,             │
│                requierePago, precio, moneda }                          │
└───────────────────────────────────────────────────────────────────────┘
```

## Flujo del Usuario

1. El usuario pega la URL de la publicación (Instagram, TikTok o YouTube).
2. Click "Analizar publicación" → se muestra loader mientras el backend recolecta comentarios.
3. Aparece el **preview**: imagen de la publicación, "Cantidad de comentarios: N", selectores de ganadores y suplentes.
4. El usuario elige cantidad de ganadores y suplentes.
5. Click "Sortear" → POST `/api/sorteos` (contrato existente) → mientras el servidor procesa, spinner.
6. **Animación**: la ruleta recorre los nombres de los participantes (efecto desaceleración) y frena en el ganador real.
7. ResultCard muestra ganador/es, suplentes (si hay) y hash de verificación con botón copiar.

## Diseño del Componente RuletaGanadores

- **Props:** `participantes: string[]`, `ganadores: string[]`, `redSocial: string`, `onTerminar?: () => void`.
- **Estado:** `indiceActual`, `fase` (girando | frenando | terminado), `ganadorMostrado`.
- **Lógica de animación:**
  - Duración total ~3.5s con easing cuadrático (`t^2`): el intervalo entre cambios crece de ~40ms hasta ~400ms.
  - Recorre los participantes en orden (con repeticiones) y se posiciona en el índice del ganador real al final.
  - Múltiples ganadores: secuencia de vueltas, una por ganador.
  - Efectos: resaltado (scale + glow + gradiente) del ganador final, confeti CSS simple opcional.
- **Accesibilidad:** `aria-live="polite"`, `prefers-reduced-motion` → mostrar el ganador directamente.
- **Visual:** card con gradiente de la red social, nombre grande en font-bold, partículas de fondo.

## Sistema de Diseño Usado

- Tailwind CSS v3 (configurado en Fase 2/3 de la mejora UI).
- Componentes base: Card, Button, Input, Loader, Alert.
- Colores por red social: Instagram (pink), TikTok (cyan), YouTube (red).
