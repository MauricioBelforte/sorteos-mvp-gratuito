# 02 — Análisis.md

## Evidencia (logs prod free, 2026-08-08, post Cm7p75TJVub ~254)

| Modo | Base RAM G-Zero | Captura | Causa |
|------|-----------------|---------|-------|
| Anónimo | 411 MB | 101 (40%) | governor de emergencia ≥92% reciclaba antes de seguir scrolleando |
| Con sesión @del (guardada) | 452 MB | 42 (16%) | 1) rama de sesión corre GRAPHQL primero (a la basura) 2) G-Zero crea contexto ANÓNIMO (tira la sesión) 3) más RAM base → reciclajes cada iteración |
| Con sesión @del (madrugada, commit pre-6bf340f) | — | 611/1035 (59%) | G-Zero reutilizaba la página del orquestador CON la sesión |

## Causa raíz

1. `instagram-v2.ts:229-245`: la cascada con sesión pone como PRIMERA estrategia
   "GraphQL interception", que abre y llena la página, consume RAM y marca
   "visibles"; G-Zero termina 4to con el contenedor ya cerca del límite.
   Con anónimo, G-Zero es PRIMERA (se verificó 144/152, 101/254).
2. `scroll-anon-gzero.ts:54-64`: desde `6bf340f` crea SIEMPRE `browser.newContext()`
   SIN `storageState` → si el orquestador trae sesión, el G-Zero ignora la sesión.
3. Cada reciclado de contexto propio anónimo recarga IG como no-logueado:
   página pesada, sin la ventaja de la sesión; y su post-reciclado no baja la
   RAM (persistencia física).

## Alternativas evaluadas

- A) Subir umbral del governor (88-95%): NO ayuda: el margen físico es ~50-90 MB.
- B) Apify (módulo 11): sin token válido en Render → 401. Bloqueado.
- C) Sesión REAL en G-Zero + cerrar contexto del orquestador → **elegida**:
  - Hereda la ventaja verificada de la madrugada (611/1035).
  - El contexto del orquestador (página inicial) puede cerrarse para liberar
    su renderer de la ram (baja la base a ~411 MB).
  - La cascada G-Zero primero igual que anónimo: 50% del esperado y corta.

## Decisión

- `scroll-anon-gzero.ts`: `tieneSesion && sessionExiste` → `newContext({ storageState: SESSION_PATH })`,
  y al reciclar `browser.newContext(...)` con el mismo storageState (y mismo route) block.
- `instagram-v2.ts`: mover `scrollAnonimo` (G-Zero) al inicio de la lista en la
  rama con sesión, cuando `SCRAPER_MODE=gzero`.
- Si G-Zero falla (resultado < mínimo), la cascada sigue con GraphQL/API/DOM después.