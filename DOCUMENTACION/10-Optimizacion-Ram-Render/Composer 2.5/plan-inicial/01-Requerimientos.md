# 01 - Requerimientos — Propuesta Composer 2.5

**Modelo:** Composer 2.5  
**Fecha:** 2026-08-07  
**Responde a:** `Mensajes entre modelos/08-Optimizacion-RAM-Render/2026-08-07_17-24-14_1-DEEPSEEK-planteo.md`  
**Módulo:** `DOCUMENTACION/10-Optimizacion-Ram-Render/Composer 2.5/`

---

## Problema

La **Estrategia G** (scroll anónimo completo con Chrome real) captura ~99% de comentarios en Instagram, pero **no cabe en el plan free de Render (512 MB)**:

| Métrica | Valor medido |
|---------|--------------|
| RAM al iniciar recolección (Chrome headless) | **477 / 512 MB** |
| Margen disponible antes del scroll | **~35 MB** |
| Tiempo hasta OOM (`exit 137`) | **~82–85 s** |
| Causa del pico | DOM acumulado + procesos Chrome + heap Node |

Las optimizaciones ya aplicadas (flags, bloqueo de imágenes, Xvfb condicional, reciclado cada 40 iteraciones, `CHROME_MODE=headless`) **no liberaron suficiente margen** porque:

1. El boot de Chrome real consume casi todo el cgroup.
2. El reciclado periódico **no se dispara** en posts chicos (≤40 iteraciones).
3. `extraerParesDOM()` recorre **todo el DOM** en cada iteración (`querySelectorAll('a[href^="/"]')`), amplificando el costo de memoria y CPU.
4. `--single-process` (ahorro teórico grande) **crashea** Chrome con Playwright.

## Objetivo de la propuesta Composer 2.5

Diseñar **Estrategia G-Lite**: un handler paralelo (`scroll-anon-graphql.ts`) que mantenga la captura alta de G pero **ataque la causa raíz del pico** (DOM acumulado + extracción DOM costosa), dejando la G original intacta para local/visible.

### Metas cuantificables

| Meta | Umbral mínimo | Objetivo |
|------|---------------|----------|
| Pico RAM en Render free | < 512 MB (sin OOM) | < 460 MB con margen |
| Captura post chico (`C347268uDMm`, 152 esp.) | ≥ 130 (85%) | ≥ 144 (95%) |
| Captura post grande (`CU7wfBaLuQK`, 2538 esp.) | ≥ 1200 (50%) en free | ≥ 2000 (80%) o fallback Apify |
| Regresión flujo local (Chrome visible) | 0 | 0 |

## Alcance

### Incluido

- Nuevo handler **`estrategiaScrollAnonimoGraphQL`** en `api/src/collectors/strategies/scroll-anon-graphql.ts`.
- Registro condicional en orquestador (`instagram-v2.ts`) cuando `SCRAPER_MODE=glite` o en nube (`RENDER=true`).
- Extracción **primaria vía interceptación GraphQL** durante el scroll (reutiliza `extraerComentariosDeGraphQL` de estrategia A).
- **Poda activa del DOM** tras cada tanda capturada (eliminar nodos de comentarios ya procesados).
- **Reciclado adaptativo**: por iteración (cada 8–10), por umbral de memoria (≥85% cgroup) y por estancamiento.
- Ajuste de heap Node: `NODE_OPTIONS=--max-old-space-size=256` en Dockerfile (libera ~128 MB teóricos al cgroup).
- Flags Chrome adicionales no probados aún (ver `03-Diseno.md`).
- Selección **tiered** de navegador según `cantidadEsperada` en free tier.
- Observabilidad extendida en `memoria.ts` (pico, delta, alerta pre-OOM).

### Excluido (fuera de esta propuesta)

- Modificar `scroll-anon-completo.ts` (flujo estable verificado en local).
- Cambiar de hosting o contratar plan pago (queda como plan D documentado).
- Reemplazar Apify como única fuente (solo fallback automático en posts grandes en free).

## Restricciones

1. **AGENTS.md §15 — Flujo separado:** G original no se toca; G-Lite es handler nuevo que comparte helpers (`extraerComentariosDeGraphQL`, `bloquearRecursosPesados`, `aceptarConsentimiento`).
2. **AGENTS.md §16 — Flujos estables:** Chrome visible + G clásica permanecen como default en desarrollo local.
3. **Sin `--single-process`:** descartado por crash verificado.
4. **Verificación local obligatoria** antes de deploy en Render.
5. Documentación en `plan-inicial/` (esta carpeta); implementación futura actualiza `plan-actual/`.

## Criterios de éxito

- [ ] `POST /api/sorteos/analizar` completa en Render free sin `exit 137`.
- [ ] Log `MEM:` muestra pico < 500 MB durante todo el scroll.
- [ ] Post chico: captura ≥ 85% de `comment_count`.
- [ ] Chrome visible local con G clásica: sin regresión (144/152 o mejor).
- [ ] Fallback Apify se activa automáticamente si G-Lite no alcanza umbral en post grande.

## Fuera de alcance inmediato

- Swap en contenedor (Render free no lo permite de forma fiable).
- Instalar solo Chromium y eliminar Chrome real del Dockerfile (rompería G local).
- Migración a worker separado (evaluable como fase 2 si G-Lite no alcanza).
