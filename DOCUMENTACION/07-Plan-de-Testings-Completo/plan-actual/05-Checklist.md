# Checklist — Plan de Testings Profesional Completo

**Componente:** 07-Plan-de-Testings-Completo  
**Fecha:** 2026-08-04  
**Responsable:** glm + DeepSeek (Cline)

---

## Checklist de Tareas

### Preparación
- [x] Leer ESTADO-PARALELO.md antes de empezar
- [x] Reclamar la tarea en ESTADO-PARALELO.md
- [x] Explorar estructura del proyecto (api/, web/, shared-modules/)
- [x] Leer documentación actual (especificaciones, diseño, tareas)
- [x] Verificar archivos 06/07 existentes en componentes
- [x] Leer archivos 06/07 existentes y código clave para identificar bugs

### Ejecución de Pruebas
- [x] TypeCheck API (`tsc --noEmit`) — ✅ Sin errores
- [x] TypeCheck Web (`tsc --noEmit`) — ✅ Sin errores
- [x] Build Web (`next build`) — ✅ Exitoso (8 páginas estáticas)
- [x] Pruebas unitarias (55 pruebas) — ⚠️ 52/55 pasaron (94.5%)
- [x] Pruebas unitarias formales con Jest (37 pruebas) — ⚠️ 36/37 pasaron (1 bug real confirmado)
- [x] Pruebas de rendimiento (smoke) — ✅ Todas < 1ms
- [ ] Pruebas de integración (endpoints API) — ⏳ Pendiente (requiere servidor)
- [ ] Pruebas de edge cases (API/Web) — ⏳ Parcial
- [ ] Pruebas de seguridad dinámicas — ⏳ Análisis estático

### Skills de Testing Instaladas (solo a nivel del proyecto)
- [x] `microsoft/playwright-cli` (109.3K installs) — CLI oficial de Playwright (`.agents/skills/playwright-cli`)
- [x] `currents-dev/playwright-best-practices` (68.2K installs) — Mejores prácticas E2E (`.agents/skills/playwright-best-practices`)
- [x] `bmad-labs/typescript-unit-testing` (405 installs) — Testing unitario TypeScript con Jest (`.agents/skills/typescript-unit-testing`)
- [x] Jest configurado en `api/` (jest.config.js + scripts test/test:unit)
- [x] 3 archivos `.spec.ts` creados (verificacion, sorteos-service, instagram-paste)

### Análisis Estático
- [x] Análisis de api/src/ (routes, lib, collectors) — 14 bugs identificados
- [x] Análisis de web/ (páginas, componentes, lib) — 4 bugs identificados
- [x] Análisis de shared-modules/mercadopago/ — Sin bugs críticos
- [x] Análisis de collectors (instagram-v2, strategies) — 4 bugs identificados

### Documentación
- [x] Crear componente 07-Plan-de-Testings-Completo en DOCUMENTACION
- [x] Crear plan de testings (06-Plan-Testings.md)
- [x] Crear script de pruebas unitarias (api/tests/unit-smoke-test.mjs)
- [x] Documentar resultados (07-Resultados-Testings.md)
- [x] Crear archivos 01-05 del componente
- [ ] Copiar archivos a plan-inicial/
- [ ] Actualizar DOCUMENTACION/README.md
- [ ] Actualizar ESTADO-PARALELO.md (marcar como completado)
- [ ] Generar log de cambios

### Bugs a Corregir (Antes de prueba manual)
- [ ] B-04: TypeError por respuesta null en /pago (alta)
- [ ] B-09: Deduplicación inconsistente (media)
- [ ] Investigar E-SORT-01 y E-SORT-03 (fallas en pruebas)

### Bugs a Corregir (Antes de deploy)
- [ ] B-01: CORS sin restricciones (alta)
- [ ] B-02: Race condition en job de cola (alta)
- [ ] B-03: Sin rate limiting (alta)
- [ ] B-05: Sin límite de body size (media)
- [ ] B-06: Sin middleware de errores global (media)
- [ ] B-07: Sin helmet ni headers de seguridad (media)
- [ ] B-08: Falta metadataBase en layout (media)