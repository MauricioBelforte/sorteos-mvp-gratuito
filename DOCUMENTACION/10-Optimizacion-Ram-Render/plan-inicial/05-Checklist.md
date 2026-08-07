# 05 - Checklist - Optimización de RAM para la Estrategia G en Render free

## Estado del módulo: DOCUMENTADO (pre-implementación)

> Módulo creado para documentar el plan ANTES de tocar el código. Los cambios reales se aplican tras aprobación y **prueba local primero** (requisito del usuario). El siguiente bloque refleja el plan.

## Plan de implementación

- [ ] **BACKUP** del código vigente antes de tocar (instagram-v2.ts, scroll-anon-completo.ts, Dockerfile) → carpeta de respaldo (ver `02-Analisis.md`).
- [ ] Ampliar `ARGS_NAVEGADOR` en `instagram-v2.ts` con: `--single-process`, `--no-zygote`, `--js-flags=--max-old-space-size=384`, `--expose-gc`, `--disable-software-rasterizer`, `--disable-features=TranslateUI,VizDisplayCompositor`; viewport `1280,720`.
- [ ] Crear `api/src/lib/memoria.ts` (helper cgroup + RSS) y loguear al inicio/final del scroll y cada ~10 iteraciones.
- [ ] Reciclado de página cada ~30 iteraciones en `scroll-anon-completo.ts` (reusar bloque de reinicio).
- [ ] `Dockerfile`: Xvfb a `-screen 0 1280x720x24`.
- [ ] Log 44 = backup + despliegue plan.
- [ ] **PRUEBA LOCAL primero** (post 152): captura ≈ esperado, estable, memoria con margen.
- [ ] Deploy a Render y verificación en vivo con log `MEM:` < 512 MB.
- [ ] Actualizar `plan-actual/` con resultados reales.
- [ ] Actualizar los `*-ACTUAL.md` de la raíz si el cambio es significativo.

## Testing (detalle en 06-Plan-Testings.md)

- [ ] P01 Flags: Chrome real sigue lanzando en local sin romper scroll.
- [ ] P02 Revision post chico (152) → captura ~140 y estable.
- [ ] P03 Memorial: `MEM:` muestre usado/limite/rss.
- [ ] P04 Reciclado: no pierde capturados previos.
- [ ] P05 Fallback: sin Chrome, cae a Chromium sin romper.
- [ ] P06 Video/reel: URL reel funciona.
- [ ] P07 Post grande (2538): captura > umbral o timeout controlado.
- [ ] P08 Sin X server: headless fallback intacto.

## Estado de seguridad del módulo

- `00` — módulo creado, aún sin cambios en código productivo.
- `10` — backup previo realizado.
- `20` — flags + helper + reciclado + Xvfb implementados.
- `30` — prueba local OK.
- `40` — despliegue y verificación en vivo OK.