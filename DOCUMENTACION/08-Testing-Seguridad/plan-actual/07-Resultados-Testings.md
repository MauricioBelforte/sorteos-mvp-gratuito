# 07-Resultados-Testings — Módulo 08: Testing de Seguridad

**Componente:** 08-Testing-Seguridad  
**Fecha:** 2026-08-05 05:02  
**Responsable:** stepfun/step 3.7 (Cline)

---

## Resumen

Se ejecutó el plan de testing de seguridad sobre la API y el frontend en `localhost`. Se confirmaron **4 bugs de seguridad** previamente identificados en el análisis estático.

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

## Resultados

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

## Tests Ejecutados

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

### Resumen combinado
- **Test Suites:** 2 failed, 2 total
- **Tests:** 5 failed, 3 passed, 8 total

## Próximos Pasos

1. Corregir B-01: restringir CORS a dominios permitidos
2. Corregir B-03: agregar rate limiting
3. Corregir B-06: sanitizar errores y remover X-Powered-By
4. Corregir B-07: agregar helmet/security headers en API y Web
5. Corregir B-08: agregar `metadataBase` en layout
6. Ejecutar nuevamente tests de seguridad para validar remediaciones

## Log

- Pendiente generación de log específico de resultados
- Tests: `api/src/__tests__/security/api-security.spec.ts`
- Tests: `api/src/__tests__/security/web-security.spec.ts`
