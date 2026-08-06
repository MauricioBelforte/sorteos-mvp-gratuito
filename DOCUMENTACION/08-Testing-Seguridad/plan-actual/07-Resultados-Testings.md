# 07-Resultados-Testings — Módulo 08: Testing de Seguridad

**Componente:** 08-Testing-Seguridad  
**Fecha:** 2026-08-05 05:02 (remediación: 2026-08-06)  
**Responsable:** stepfun/step 3.7 (Cline) → continuado por DeepSeek (opencode)

---

## Resumen

Se ejecutó el plan de testing de seguridad sobre la API y el frontend en `localhost`. Se confirmaron **5 bugs de seguridad** previamente identificados en el análisis estático. Todos fueron **corregidos y validados** con la suite de tests pasando 17/17 en seguridad y 59/59 en la suite completa del backend.

Además, el testing completo detectó un **bug funcional adicional** en la selección de ganadores (`src/lib/verificacion.ts`), no relacionado con seguridad pero crítico, que también fue corregido (detalle al final).

## Ejecución

### Fase 1: Reconocimiento
- API activa en `http://localhost:4000`
- Web activa en `http://localhost:3000`
- Endpoints relevados: `/api/sorteos/cuota`, `/api/sorteos/analizar`, `/api/pagos`, `/api/instagram/estado`, `/health`

### Fase 2: Scanning
- Dependencias: no auditadas en profundidad
- CORS: configuración detectada como insegura (wildcard)
- Headers de seguridad: ausentes en `/health` y en respuestas HTML

### Fase 3: API Security Testing
- CORS: confirmado bug B-01
- Rate limiting: confirmado bug B-03
- Body size limit: **NO es bug** (rechaza 10MB con 413)
- Error handling: confirmado bug B-06
- Security headers: confirmado bug B-07

### Fase 4: Web Security Testing
- Security headers: confirmado bug B-07 también en Web
- metadataBase: confirmado bug B-08
- XSS reflejado: **NO es bug** (no refleja input malicioso)

## Resultados (pre-remediación)

| Bug | Severidad | Estado | Hallazgo |
|-----|-----------|--------|----------|
| B-01 | Alta | ❌ Confirmado | CORS con `*` en `api/src/index.ts:13` |
| B-02 | Alta | ⏳ No probado dinámicamente | Race condition en `setInterval` de cola |
| B-03 | Alta | ❌ Confirmado | Sin rate limiting (50 requests sin 429) |
| B-04 | Alta | ⏳ No probado dinámicamente | TypeError por respuesta null en `/pago` |
| B-05 | Media | ✅ No es bug | Body size limit rechaza 10MB (413) |
| B-06 | Media | ❌ Confirmado | Stack traces/X-Powered-By expuestos |
| B-07 | Media | ❌ Confirmado | Faltan headers: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, X-Powered-By |
| B-08 | Media | ❌ Confirmado | Falta `metadataBase` en `web/app/layout.tsx` |

## Tests Ejecutados (pre-remediación)

### API Security (`api/src/__tests__/security/api-security.spec.ts`)
- **Resultado:** 2 pasaron, 4 fallaron
- **Tiempo:** 3.182s

#### Tests que pasaron
- Body size limit (B-05) → PROTECTED

#### Tests que fallaron
- CORS arbitrary origins (B-01) → permite `*`
- Rate limiting (B-03) → sin 429
- Error handling (B-06) → stack trace/X-Powered-By
- Security headers (B-07) → headers faltantes

### Web Security (`api/src/__tests__/security/web-security.spec.ts`)
- **Resultado:** 1 pasó, 2 fallaron
- **Tiempo:** ~2s

#### Tests que pasaron
- XSS reflejado → NO refleja input malicioso

#### Tests que fallaron
- Security headers (B-07) → headers faltantes en Web
- MetadataBase (B-08) → falta en `layout.tsx`

### Resumen combinado (pre-remediación)
- **Test Suites:** 2 failed, 2 total
- **Tests:** 5 failed, 3 passed, 8 total

## Remediación (2026-08-06)

| Bug | Fix aplicado | Archivo |
|-----|--------------|---------|
| B-01 | CORS restringido a `WEB_APP_URL` + localhost:3000/127.0.0.1:3000; rechazo con 403 explícito | `api/src/index.ts` |
| B-03 | Rate limiting 100 req/15 min por IP (configurable vía `RATE_LIMIT`), headers estándar draft-7 | `api/src/index.ts` |
| B-06 | Error handler sin stack traces, `app.disable('x-powered-by')` | `api/src/index.ts` |
| B-07 | `helmet()` en API; `poweredByHeader: false` en web (`web/next.config.js`) | `api/src/index.ts`, `web/next.config.js` |
| B-08 | `metadataBase` agregado | `web/app/layout.tsx` |
| B-04 | Manejo de respuesta null en `/pago` | `web/app/pago/page.tsx` |
| B-02 | Pendiente (race condition en cola, análisis aparte) | — |
| Extra | Validación de URLs en `/api/sorteos/analizar` (protocolo + host según red social) → 400 en vez de 500 | `api/src/routes/preview.ts` |

### Mejoras adicionales del proceso de testing
- El test de rate limiting (B-03) usa ahora una **IP ficticia** (`X-Forwarded-For: 203.0.113.99`) y `app.set('trust proxy', 1)` en la API: la suite no contamina la IP local del desarrollador con 429 durante 15 minutos.
- CORS con origen malicioso devuelve **403** (antes 500) con mensaje claro.

## Resultados (post-remediación)

### API Security (`api/src/__tests__/security/api-security.spec.ts`)
- **Resultado:** 17 pasaron, 0 fallaron
- **Tiempo:** ~4s

### Web Security (`api/src/__tests__/security/web-security.spec.ts`)
- **Resultado:** 3 pasaron, 0 fallaron
- **Tiempo:** ~2s

### Suite completa del backend
- **Test Suites:** 6 passed, 6 total
- **Tests:** 59 passed, 59 total

## Bug funcional adicional detectado y corregido

**Bug de selección de ganadores** (`api/src/lib/verificacion.ts:45`):
- **Síntoma:** con N participantes únicos y pidiendo N ganadores, se devolvían N-1 (el test "debería ignorar duplicados" recibía 2 en vez de 3).
- **Causa raíz:** la condición del loop `i < Math.min(cantidad, disponibles.length)` recalculaba el límite en cada iteración; el `splice` encogía `disponibles.length` y el loop terminaba antes.
- **Fix:** el límite `total` se calcula una sola vez antes del loop.
- **Validación:** 50/50 corridas reproducen 3 ganadores; suite `verificacion.spec.ts` y completa en verde.

## Próximos Pasos

1. ✅ B-01: CORS restringido y validado (403 en origen malicioso)
2. ✅ B-03: Rate limiting activo y testeado sin contaminar la IP local
3. ✅ B-06: Errores sanitizados y X-Powered-By removido
4. ✅ B-07: helmet/security headers en API y Web
5. ✅ B-08: `metadataBase` agregado
6. ✅ Re-ejecutar tests: 17/17 seguridad, 59/59 backend
7. ⏳ B-02: analizar race condition de la cola (fuera de alcance de esta iteración)
8. ⏳ Deploy a Render (API) y Vercel (web) con las nuevas variables (RATE_LIMIT, WEB_APP_URL)

## Log

- Tests: `api/src/__tests__/security/api-security.spec.ts`
- Tests: `api/src/__tests__/security/web-security.spec.ts`
- Fixes: `api/src/index.ts`, `api/src/routes/preview.ts`, `api/src/lib/verificacion.ts`, `web/next.config.js`, `web/app/layout.tsx`, `web/app/pago/page.tsx`
- Log de la iteración: `Logs/39-...` (ver carpeta `Logs/`)
