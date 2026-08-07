# 07 - Resultados de Testings - Optimización de RAM para la Estrategia G en Render free

> **Estado: RESUELTO EN PRODUCCIÓN ✅ (2026-08-07).** La solución es `CHROME_MODE=chromium`
> (Chromium embebido headless). El free de 512 MB ya NO muere por OOM: el flujo anónimo
> capturó 144/152 en prod sin `server_failed`.

## Resumen

| Fecha | Pruebas ejecutadas | Resultado | Comentario |
|-------|--------------------|-----------|------------|
| 2026-08-07 | P01 flags de Chrome (5 variantes) | **Fallo parcial → corrección** | `--single-process` crashea Chrome real; se eliminó |
| 2026-08-07 | P02 endpoint post real (152), visible | **PASS** | 142 participantes local (baseline) |
| 2026-08-07 | P03 log `MEM:` | **PASS** | Log funciona (rssMb:140 en local, sin cgroup) |
| 2026-08-07 | P02b visible + bloqueo imágenes (local) | **PASS** | 144 participantes |
| 2026-08-07 | P06a `CHROME_MODE=headless` (Chrome real headless, prod) | **FAIL** | OOM exit 137 a ~82s (boot 477/512); solo ~7 MB mejor que visible |
| 2026-08-07 | **P09 `CHROME_MODE=chromium` (Chromium embebido, prod)** | **PASS** | 144 participantes anónimo, **sin OOM**, ~5 min |
| 2026-08-07 | P04 post grande (2538) | Pendiente | Chromium embebido capturaría ~59 de 2538 (histórico); evaluar Apify/plan pago |

## Detalle por prueba

### P01 — Lanzamiento de Chrome con flags
- **Resultado:** Corregido — `--single-process` eliminado (CRASH: navegador DISCONNECTED al cargar página). El resto estable.

### P02 — Endpoint sobre post (152)
- **Resultado:** PASS — 142 participantes (local, flags + reciclado). Captura de referencia: `6dc17216-...`.

### P03 — Log `MEM:`
- **Resultado:** PASS. En local usado/limite=0 (sin cgroup); en Render se leen cgroup v2 reales.

### P06a — `CHROME_MODE=headless` (Chrome real, headless nuevo)
- **Resultado:** FAIL en producción. `MEM: inicio recolección {"usadoMb":477,"limiteMb":512}` → OOM `exit 137` a los ~82s, request 502. El headless nuevo de Chrome sigue renderizando páginas; solo ahorra el Xvfb (~7 MB).

### P09 — `CHROME_MODE=chromium` (Chromium embebido headless) — **SOLUCIÓN**
- **Local:** 144/152 capturados (igual que Chrome real) en `analizar` local con sesión guardada.
- **Producción:** deploy `dep-d9r40rjocm9c73a8mr40` live 20:33 UTC.
  - POST `/api/sorteos/analizar` sobre `C347268uDMm` (anónimo sin sesión).
  - **RESULTADO: 144 participantes** → captura DB `bb4a2753-0765-46b4-9e4c-0ed4c24a7da2` (20:38:39 UTC, sesion=anonima).
  - **Sin `server_failed`/OOM en eventos de Render** (diferencia clave vs. los intentos con Chrome real).
  - Tardó ~5 min (el request superó el timeout del cliente de la prueba, pero el server completó y persistió en DB).
- **Qué se cambió:** `instagram-v2.ts` (variable `CHROME_MODE=chromium`) + `Dockerfile` (Xvfb solo si no hay CHROME_MODE). Commit `d13d674`.

## Incidentes encontrados

1. **`--single-process` crashea Chrome real** (P01). Eliminado de `ARGS_NAVEGADOR`.
2. **Chrome real (visible o headless) NO cabe en 512 MB** — el boot es 477-484 MB y el scroll suma el pico → OOM (~82s). Los microahorros (imágenes, Xvfb, flags) son ≤37 MB.
3. **Chromium embebido resuelve free**: consume suficiente menos para no OOM y captura igual en posts chicos.

## Conclusión

- **El MVP free queda resuelto con `CHROME_MODE=chromium`** para el flujo anónimo: capta ~100% en posts chicos (144/152) sin OOM en 512 MB.
- **Para posts grandes (~2500+)**, Chromium embebido pierde parte (histórico 59 vs 2538): requiere Chrome real (Render Standard USD 25/mes) o Apify como primario.
- Queda el P04 (post grande en prod con Chromium emputado) como pendiente opcional del MVP free.