# 02 - Análisis - Optimización de RAM para la Estrategia G en Render free

## Análisis del dominio

### Contexto de la falla (verificado en vivo, Log 43)

1. Deploy `9af19c4` → `1f5a0b5`: se arregló que el canal `chrome` no quedara instalado (browsers instalados después del `npm install` desde `/app/api`). El Chrome real **arranca** en Render: "navegador visible (Chrome real)", "152 comentarios esperados", "intentando Scroll anónimo completo...".
2. Deploy `c3b29a5`: se agregaron flags de bajo consumo (`--disable-dev-shm-usage`, `--no-sandbox`, `--disable-gpu`, desactivación de background) + `NODE_OPTIONS=--max-old-space-size=384`.
3. **Resultado:** el contenedor **igual muere por OOM** durante el scroll: Render reportó `Instance failed: ntn6c — Ran out of memory (used over 512MB)`. El front muestra `Failed to fetch` porque el request se corta en el reinicio.

**Causa raíz:** el scroll infinito de Instagram agrega miles de nodos al DOM de Chrome y Chrome los retiene en memoria (nodos detached incluidos — ver issues de Playwright #6319, #16832, #41462). Con un post de 152 comentarios ya supera 512 MB en el plan free. Un post de 2538 comentarios (CU7wfBaLuQK) sería peor.

### Datos duros

- Render free tier: **512 MB** RAM, sin métricas de memoria en dashboard, sin shell.
- Chrome real (canal `chrome`, headful): varios procesos (browser, zygote, GPU, renderer(s), utility) → cada uno con RSS propio. Flags `--single-process` + `--no-zygote` consolidan todo en un solo proceso (ahorro documentado de 500 MB–1 GB por instancia en la comunidad openclaw/TypeClaw).
- Docker: `/dev/shm` default 64 MB; ya se usa `--disable-dev-shm-usage` (escribe en `/tmp`).
- Xvfb agrega ~50–100 MB extra; se puede bajar la resolución (`1280x720x24` en vez de `1280x1024x24`).
- El DOM acumulado es la mayor parte del pico; se puede **reciclar la página**: cerrar y reabrir una página nueva cada N iteraciones libera la memoria (un `reload()` NO la libera; cerrar página SÍ — issue #6319). El dataset (`vistos`) vive en Node, no en el DOM: no se pierde nada al reciclar.
- `--js-flags=--max-old-space-size=384` (y `--expose-gc` para llamar `window.gc()`) acotan el heap del renderer.

## Alternativas evaluadas

| Alternativa | Pros | Contras | Decisión |
|---|---|---|---|
| **A. Flags agresivos + reciclado de página + Xvfb chico + observabilidad** | Gratis, sin cambiar de plan ni de proveedor; mantiene Estrategia G | `--single-process` puede romper ciertas páginas (a probar); complejidad de implementación | **ELEGIDA** para probar en local primero |
| B. Apify como fuente primaria | Cero RAM local; ya integrado; token real | Consume cuota mensual (45/mes); resultados a veces peores (~15 si IG bloquea) | Standby (documentado en módulo 06 / Log 43) |
| C. Subir plan de Render (más RAM) | La Estrategia G al 99% tal cual | Costo mensual | Futuro pago / cuando escale |
| D. Limitar iteraciones/`cantidadMaxima` en la nube | Simple | Degrada la captura; no garantiza posts grandes | Backup si A no alcanza |

## Decisiones de diseño (provisorias, a validar en local)

1. **Flags de Chrome** en `ARGS_NAVEGADOR` (instagram-v2.ts): agregar `--single-process`, `--no-zygote`, `--js-flags=--max-old-space-size=384` (y `--expose-gc`), `--disable-software-rasterizer`, `--disable-features=TranslateUI,VizDisplayCompositor`. Mantener `--disable-dev-shm-usage`, `--no-sandbox`, `--disable-gpu`, etc.
2. **Reciclado periódico de página** en `scroll-anon-completo.ts`: cada ~30 iteraciones (o al detectar pico) cerrar la página, abrir una nueva (mismo contexto anónimo), volver a `page.goto(url)` y retomar el scroll desde donde quedó la cuenta `vistos` (que vive en Node). Reusa la lógica de reinicio existente.
3. **Xvfb**: bajar a `-screen 0 1280x720x24`; viewport de la página a `1280x720`.
4. **Observabilidad**: helper que lee `/sys/fs/cgroup/memory.current` vs `memory.max` + `process.memoryUsage().rss`; loguear al inicio/fin del scroll y cada ~10 iteraciones. Activar siempre en producción (o con env var `DEBUG_MEM=1`).
5. **Prueba local primero** (requisito del usuario): correr la versión optimizada en Windows local con el post real `C347268uDMm` y comparar captura vs baseline (2393/2399 es el techo del post grande; 152 esperados en el post chico). Si local captura bien y la medición muestra margen, recién ahí desplegar.

## Riesgos y mitigaciones

- `--single-process` rompe alguna página de IG → probar en local; si rompe, probar sin él (solo `--no-zygote`) y medir.
- Reciclar página cada 30 iteraciones aumenta el tiempo total (cada reciclado = goto + scroll inicial) → calibrar N con la medición.
- Xvfb 720p no alcanza para ver la sidebar completa → el scroll usa `mouse.move(1000, 450)` y wheel; 720 de alto sigue alcanzando para disparar la carga (validar).