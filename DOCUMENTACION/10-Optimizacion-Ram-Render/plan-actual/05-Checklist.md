# 05 - Checklist - Optimización de RAM para la Estrategia G en Render free

## Estado del módulo: IMPLEMENTADO — PRUEBA LOCAL OK (2026-08-07)

> La optimización se implementó y **se probó en LOCAL** con el post real de 152 comentarios: **142 participantes capturados** (baseline ~140), logs `MEM:` activos. Ver `07-Resultados-Testings.md`.

## Plan de implementación

- [x] **BACKUP** del código vigente antes de tocar (instagram-v2.ts, scroll-anon-completo.ts, Dockerfile) → `Obsoletos/10-Optimizacion-RAM-2026-08-07_15-40-22/`.
- [x] Ampliar `ARGS_NAVEGADOR` en `instagram-v2.ts` con: `--no-zygote`, `--js-flags=--max-old-space-size=384`, `--expose-gc`, `--disable-software-rasterizer`, `--disable-features=TranslateUI,VizDisplayCompositor`; viewport `1280,720`.
  - ⚠️ **`--single-process` FALLA**: Chrome real se corta al navegar (crash verificado en local). Se eliminó de la lista.
- [x] Crear `api/src/lib/memoria.ts` (helper cgroup + RSS) y loguear al inicio del scroll (`MEM:` en `scroll-anon-completo.ts`).
- [x] Reciclado de página en `scroll-anon-completo.ts` (cada 40 iteraciones, reusando la lógica `recargarPagina()` extraída del reinicio).
- [x] `Dockerfile`: Xvfb a `-screen 0 1280x720x24`.
- [x] Log 44 = creación del módulo + backup.
- [x] **PRUEBA LOCAL** (post 152): captura 142/152, estable, `MEM: {rssMb:140}`.
- [ ] Deploy a Render y verificación en vivo con log `MEM:` < 512 MB (falta desplegar esta versión).
- [ ] Actualizar los `*-ACTUAL.md` de la raíz si el cambio es significativo.
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