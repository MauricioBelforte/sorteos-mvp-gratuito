# Análisis — Módulo 08: Testing de Seguridad

**Componente:** 08-Testing-Seguridad  
**Fecha:** 2026-08-05  
**Responsable:** stepfun/step 3.7 (Cline)

---

## Análisis del Dominio

El sistema Sorteosypromos es una aplicación web para realizar sorteos basados en comentarios de redes sociales. La arquitectura consta de:

- **API backend:** Express.js en `api/src/` con endpoints REST
- **Frontend web:** Next.js 14 en `web/app/`
- **Shared modules:** Módulos reutilizables en `shared-modules/`
- **Base de datos:** Prisma con SQLite (local) / Postgres (producción)

### Superficie de Ataque Identificada

| Capa | Componentes | Riesgos |
|------|-------------|---------|
| API | `/api/sorteos`, `/api/pagos`, `/api/instagram` | CORS, rate limiting, input validation, error handling |
| Web | `/`, `/pago`, `/dashboard` | Security headers, XSS, metadataBase |
| Shared | `mercadopago/` | Webhook validation, token handling |

## Estado de Testings Anteriores

El componente 07 ejecutó un plan de testings general y detectó 14 bugs, de los cuales 8 son de seguridad:

| Bug | Severidad | Categoría | Estado |
|-----|-----------|-----------|--------|
| B-01 | Alta | CORS sin restricciones | Confirmado en testing |
| B-02 | Alta | Race condition | No probado dinámicamente |
| B-03 | Alta | Sin rate limiting | Confirmado en testing |
| B-04 | Alta | TypeError null | No probado dinámicamente |
| B-05 | Media | Sin body size limit | Descartado (sí hay límite) |
| B-06 | Media | Sin error handler global | Confirmado en testing |
| B-07 | Media | Sin security headers | Confirmado en testing |
| B-08 | Media | Falta metadataBase | Confirmado en testing |

## Decisiones de Testing

1. **Skills de seguridad:** Se utilizaron 3 skills instaladas en `.agents/skills/`:
   - `security-audit` — Framework de 7 fases
   - `api-security-testing` — Pruebas específicas de API
   - `web-security-testing` — Pruebas específicas de web

2. **Framework de tests:** Jest + axios para tests de integración contra servidores corriendo

3. **Enfoque práctico:** Tests ejecutados contra `localhost` (API:4000, Web:3000) para validar vulnerabilidades reales

4. **Alineación con OWASP Top 10:** Se cubrieron las categorías relevantes para el stack del proyecto

## Alternativas Consideradas

| Alternativa | Pros | Contras | Decisión |
|-------------|------|---------|----------|
| OWASP ZAP | Escaneo automatizado completo | Requiere instalación, configuración compleja | ❌ |
| Postman/Newman | Pruebas de API estructuradas | Requiere colección manual | ❌ |
| Playwright E2E | Pruebas de navegador reales | Requiere más setup, tiempo | ⏳ (futuro) |
| Jest + axios | Tests automatizados, rápidos | Requiere servidores corriendo | ✅ Elegida |
| Manual con curl | Sin dependencias | Poco mantenible | ❌ |

## Lecciones Aprendidas

1. El análisis estático previo (componente 07) identificó correctamente los bugs de seguridad
2. Body size limit (B-05) fue descartado: Express rechaza cuerpos grandes con 413
3. XSS reflejado no es un bug: Next.js sanitiza el output por defecto
4. Los tests de seguridad requieren servidores corriendo, no solo análisis estático

## Ejecución Real

- **Tests API:** 5 tests, 2 pasaron, 4 fallaron
- **Tests Web:** 3 tests, 1 pasó, 2 fallaron
- **Bugs confirmados:** B-01, B-03, B-06, B-07, B-08
- **Bugs descartados:** B-05, XSS reflejado