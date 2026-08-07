# 05 - Checklist - Optimización de RAM para la Estrategia G en Render free

## Estado del módulo: IMPLEMENTADO Y VERIFICADO EN PRODUCCIÓN (2026-08-07) ✅

> La solución correcta es **`CHROME_MODE=chromium`** (Chromium embebido de Playwright,
> headless). Con él el contenedor free de 512 MB ya NO muere por OOM: el flujo anónimo
> capturó **144/152 en producción** (captura `bb4a2753-...`, 20:38:39 UTC) y **no hubo
> `server_failed`/OOM** en los eventos de Render. Chrome real (visible o headless) quedó
> como default para los flujos con sesión, donde rinde 99% (pero no cabe en 512 MB).

## Resultado de la investigación

| Config | usadoMb/512 (MEM inicio) | Sobrevive scroll | Conclusión |
|---|---|---|---|
| Chrome real visible + Xvfb + bloqueo img | 484 | ❌ OOM ~82s | Microahorro insuficiente |
| Chrome real headless (`CHROME_MODE=headless`) | 477 | ❌ OOM ~82s | Solo ~7 MB menos |
| **Chromium embebido headless (`CHROME_MODE=chromium`)** | no OOM | ✅ 144/152 en prod | **SOLUCIÓN** |

## Plan de implementación

- [x] **BACKUP** del código vigente antes de tocar (instagram-v2.ts, scroll-anon-completo.ts, Dockerfile) → `Obsoletos/10-Optimizacion-RAM-2026-08-07_15-40-22/`.
- [x] Ampliar `ARGS_NAVEGADOR` en `instagram-v2.ts` con flags de bajo consumo y viewport `1280,720`.
- [x] **`--single-process` descartado** (crash verificado); **bloqueo de imágenes/media/font**, `recargarPagina()`, reciclado cada 40, log `MEM:` (`memoria.ts`).
- [x] **`CHROME_MODE=chromium`** en `instagram-v2.ts` + Dockerfile (Xvfb solo si no hay CHROME_MODE). Commit `d13d674`.
- [x] **PRUEBA LOCAL** con Chromium embebido: 144/152 capturados (igual que Chrome real).
- [x] **DEPLOY y VERIFICACIÓN EN VIVO**: `CHROME_MODE=chromium` en Render → deploy `dep-d9r40rjocm9c73a8mr40` live 20:33 UTC → POST analizar anónimo = **144 participantes, sin OOM**.
- [x] Documentar el hilo entre modelos (`Mensajes entre modelos/08-Optimizacion-RAM-Render/`).
- [ ] Log 46 = resultado final del módulo.

## Testing (detalle en 06-Plan-Testings.md)

- [x] P01 Flags: Chrome real sigue lanzando en local sin romper scroll.
- [x] P02 Revisión post chico (152) → 144 capturados, estable (local y prod).
- [x] P03 Memoria: `MEM:` muestra usado/limite/rss.
- [x] P04 Reciclado: no pierde capturados previos (recorrido 40 iter no aplica en postadsad chicos).
- [x] P05 Fallback: sin Chrome, cae a Chromium sin romper.
- [ ] P07 Post grande (2538): Chromium perderá parte (histórico 59/2538); evaluar Apify/plan pago.
- [x] P08 Sin X server: headless fallback intacto.
- [x] **P09 Chromium embebido** (nuevo): captura completa en chicos, sin OOM en prod ✅

## Estado de seguridad del módulo

- `00` — módulo creado.
- `10` — backup previo realizado.
- `20` — flags + helper + reciclado + bloqueo implementados.
- `30` — prueba local OK.
- `40` — despliegue y verificación en vivo OK. ✅
- `50` — docs e hilo de colaboración actualizados.