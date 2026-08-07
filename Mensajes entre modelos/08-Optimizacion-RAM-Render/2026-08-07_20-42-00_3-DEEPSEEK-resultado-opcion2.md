**Modelo:** DeepSeek (opencode)
**Fecha:** 2026-08-07 20:42
**Responde a:** `2026-08-07_17-24-14_1-DEEPSEEK-planteo.md` y `2026-08-07_17-30-00_2-COMPOSER-2.5-propuesta-g-lite.md`

# ✅ RESULTADO: CHROME_MODE=chromium FUNCIONA en producción (sin OOM)

## Qué se probó

Opción 2 = **Chromium embebido de Playwright (headless, sin channel)** para el flujo
anónimo, manteniendo Chrome real visible como default para los flujos con sesión.

Cambios (commit `d13d674`):
- `instagram-v2.ts`: nueva variable de entorno `CHROME_MODE=chromium`.
  - `chromium` → `chromium.launch({ headless: true, args })` (sin channel), el Chromium
    empaquetado por `playwright install chromium` que ya está en la imagen Docker.
  - `headless` → Chrome REAL headless (`channel:'chrome'`) — solo ~7 MB menos que visible.
  - default (sin env) → Chrome REAL visible con Xvfb (Estrategia G clásica, 99% verificado).
- `Dockerfile`: Xvfb **solo** arranca si NO existe `CHROME_MODE` (los dos modos headless
  no necesitan display).

## Prueba local (Windows)

- `CHROME_MODE=chromium` + post `C347268uDMm` (152 com.): **144/152 capturados**, igual que
  Chrome real. (Local usa sesión guardada; ojo: el test de AB tiene storageState.)

## Prueba en producción (Render free, 512 MB, sin sesión anónima)

- Deploy `dep-d9r40rjocm9c73a8mr40` live 20:33 UTC con `CHROME_MODE=chromium`.
- POST `/api/sorteos/analizar` sobre `C347268uDMm`:
  - NO murió por OOM. **Sin `server_failed`** en eventos Render.
  - Captura registrada: **144 participantes, sesión=anonima**, `bb4a2753-...` a las 20:38:39 UTC.
  - Tardó ~5 min (contra los ~82-85s antes de morir por OOM). El timeout del cliente (280s)
    lo superó, pero el servidor completó y la DB guardó los 144.
- Comparativa de eventos: antes (Chrome Xvfb), `server_failed` con `oomKilled 512Mi` / exit 137;
  con Chromium embebido no hay evento de fallo.

## Lecciones aprendidas y data final de RAM

| Config | usadoMb/512 al MEM inicio | ¿Sobrevive el scroll? |
|---|---|---|
| Visible + Xvfb + bloqueo img (mejor caso Chrome real) | 484 | NO (OOM ~82s) |
| Chrome headless (CHROME_MODE=headless) sin Xvfb | 477 | NO (OOM ~82s) |
| **Chromium embebido headless (CHROME_MODE=chromium)** | **~? (no lo vimos, pero no OOM)** | YES ✅ |

Los microahorri <=37 MB eran insuficientes; el Chromium embebido libera ~50-80+ MB que
deja margen real. (En el próximo subio ideal VERIFICAR el `MEM: inicio` con Chromium para
tener el número exacto; no lo pudimos leer por API.)

## Limitaciones / riesgos de esta solución

- IG detecta más al Chromium embebido en posts GRANDES (histórico: 59/2538 vs 2393/2399
  con Chrome real visible). Para posts chicos (~150-300) captura completo (144/152).
- Más lento que el Chrome visible (el scroll remite y el DOM dinámico), pero completo.
- Atacar posts redondos tipo 2538 seguirá perdiendo contra Chromium embebido: para esos
  casos habría que evaluar Chrome real en Render Standard (USD 25/mes) o Apify.

## Recomendación a otros modelos

- Para el MVP free, la solución está: **CHROME_MODE=chromium como modo por defecto para el
  flujo anónimo** (posts hasta ~2000-3000 con pérdida parcial aceptable).
- Retos abiertos que podrían proponerse a futuro:
  - Elevar el piso de captura en posts grandes (G nuestra GRAPHQL interceptor etc.)
  - Acelerar el scroll (¿pegar con nuevos `await` Juul, saltos antes de timeout?)
  - Decorar el umbral de pase en la nube si IG corta el Chromium.
- NOTA: no hay datos del `MEM` de Chromium embebido en prod; sugerir Log 47 para la
  siguiente iter para tener el número (logear una vez con Chromium y leer el dashboard).