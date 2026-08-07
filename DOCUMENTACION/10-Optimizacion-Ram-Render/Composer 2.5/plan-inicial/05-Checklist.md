# 05 - Checklist — Propuesta Composer 2.5 (Estrategia G-Lite)

**Modelo:** Composer 2.5  
**Fecha:** 2026-08-07  
**Responde a:** `Mensajes entre modelos/08-Optimizacion-RAM-Render/2026-08-07_17-24-14_1-DEEPSEEK-planteo.md`  
**Estado del módulo:** 📋 PLAN DOCUMENTADO — sin implementación en código

---

## Fase 0 — Documentación (esta entrega)

- [x] Leer `AGENTS.md` y respetar flujos estables (§15, §16).
- [x] Analizar hilo `08-Optimizacion-RAM-Render` (DeepSeek).
- [x] Revisar código actual: `scroll-anon-completo.ts`, `instagram-v2.ts`, `memoria.ts`, `Dockerfile`.
- [x] Crear carpeta `DOCUMENTACION/10-Optimizacion-Ram-Render/Composer 2.5/plan-inicial/`.
- [x] Redactar 5 archivos obligatorios con propuesta G-Lite.
- [x] Registrar mensaje en `Mensajes entre modelos/08-Optimizacion-RAM-Render/` (respuesta Composer 2.5).
- [ ] Actualizar `ESTADO-PARALELO.md` con tarea documentación Composer 2.5.

---

## Fase 1 — Preparación (pre-código)

- [ ] Backup en `Obsoletos/` de: `instagram-v2.ts`, `memoria.ts`, `Dockerfile` (si no existe backup reciente).
- [ ] Crear rama o flag `SCRAPER_MODE=glite` documentado.
- [ ] Definir posts de prueba:
  - Chico: `C347268uDMm` (152 esp.)
  - Grande: `CU7wfBaLuQK` (2538 esp.)

---

## Fase 2 — Implementación core

- [ ] Extender `api/src/lib/memoria.ts` (`porcentaje`, `margenMb`, `debeReciclarPorMemoria`).
- [ ] Crear `api/src/collectors/strategies/lib/podar-dom.ts`.
- [ ] Crear `api/src/collectors/strategies/scroll-anon-graphql.ts` (G-Lite completo).
- [ ] Wire en `instagram-v2.ts`: selector G vs G-Lite + auto-tier Chrome.
- [ ] Agregar `ARGS_NAVEGADOR_LITE` con flags no probados (`--renderer-process-limit=1`, etc.).
- [ ] Actualizar `Dockerfile`: `NODE_OPTIONS=256`, envs nube.

---

## Fase 3 — Pruebas locales (obligatorio antes de Render)

### Funcionales

- [ ] **T01** Local sin flags: G clásica + Chrome visible → 144+/152 (regresión cero).
- [ ] **T02** Local `SCRAPER_MODE=glite`: G-Lite → ≥130/152.
- [ ] **T03** Local G-Lite: GraphQL captura > DOM-only (comparar logs).
- [ ] **T04** Poda DOM: scroll sigue cargando comentarios tras poda.
- [ ] **T05** Reciclado iter-8: post chico dispara al menos 1 reciclado.
- [ ] **T06** Reciclado memoria simulado: forzar umbral bajo (`RECICLO_MEM_UMBRAL=0.5`) → recicla.

### Memoria

- [ ] **T07** Log `MEM:` en cada fase; pico local RSS documentado.
- [ ] **T08** Post grande local G-Lite: captura documentada vs baseline G clásica.

### Integración

- [ ] **T09** `POST /api/sorteos/analizar` E2E local con G-Lite.
- [ ] **T10** Con sesión guardada: G clásica sigue siendo la usada (o G-Lite no rompe A/B/C).

---

## Fase 4 — Deploy Render free

- [ ] Set env en Render: `RENDER=true`, `SCRAPER_MODE=glite`, `RECICLO_ITER=8`.
- [ ] Deploy y probar post chico `C347268uDMm`.
- [ ] Verificar logs: `MEM:` pico < 512 MB, sin `exit 137`.
- [ ] Verificar captura ≥ 85% (130+/152).
- [ ] Probar post grande: G-Lite + fallback Apify si < umbral.

---

## Fase 5 — Documentación post-implementación

- [ ] Copiar/adaptar estos 5 archivos a `plan-actual/` con resultados reales.
- [ ] Crear `06-Plan-Testings.md` y `07-Resultados-Testings.md` en `plan-actual/`.
- [ ] Log en `Logs/` (leer `ULTIMO_NUMERO.txt`).
- [ ] Actualizar `DOCUMENTACION/3-DOCUMENTO-TAREAS-ACTUAL.md` si aplica.
- [ ] Mover hilo a `RESUELTOS/` solo si OOM queda resuelto en free.

---

## Criterios de aceptación final

| # | Criterio | Estado |
|---|----------|--------|
| C1 | Render free post 152 sin OOM | ⬜ Pendiente |
| C2 | Captura ≥ 85% post chico en free | ⬜ Pendiente |
| C3 | G clásica local sin regresión | ⬜ Pendiente |
| C4 | Logs MEM con margen > 20 MB en pico | ⬜ Pendiente |
| C5 | Plan B (Apify) funciona en post grande free | ⬜ Pendiente |

---

## Plan B — Si G-Lite no alcanza en free

1. Activar Apify como primario para `cantidadEsperada > 300` en free (cero RAM scraping).
2. Mantener G-Lite solo para posts ≤300 en free.
3. Documentar recomendación Render Standard (2 GB) para posts grandes sin Apify.
4. Evaluar worker separado (fase 2) — segundo servicio Render free solo para scraping.

---

## Comparativa con propuesta DeepSeek (módulo 10 plan-inicial raíz)

| Aspecto | DeepSeek (actual) | Composer 2.5 (G-Lite) |
|---------|-------------------|------------------------|
| Handler | Modifica G in-place | Handler paralelo nuevo |
| Extracción | DOM (`extraerParesDOM`) | GraphQL primario + DOM fallback |
| Reciclado | Cada 40 iter | Cada 8 iter + umbral memoria |
| Node heap | 384 MB | 256 MB |
| Chrome tier | Manual `CHROME_MODE` | Auto-tier por `cantidadEsperada` |
| Poda DOM | No | Sí |
| Riesgo G local | Medio | Bajo (G intacta) |
