# 01-Requerimientos — Módulo 08: Testing de Seguridad

**Componente:** 08-Testing-Seguridad  
**Fecha:** 2026-08-05  
**Responsable:** stepfun/step 3.7 (Cline)

---

## Problema

El análisis estático del proyecto identificó **14 bugs**, de los cuales **4 son de seguridad alta** (B-01 a B-04) y **4 de seguridad media** (B-05 a B-08). Estos bugs representan vulnerabilidades que deben evaluarse antes de pasar a producción:

- B-01: CORS sin restricciones (API)
- B-02: Race condition en job de cola (API)
- B-03: Sin rate limiting (API)
- B-04: TypeError por respuesta null (Web)
- B-05: Sin límite de body size (API)
- B-06: Sin middleware de errores global (API)
- B-07: Sin helmet ni headers de seguridad (API)
- B-08: Falta metadataBase en layout (Web)

No existe un plan de testing de seguridad formalizado. Las pruebas actuales son unitarias/funcionales, pero no cubren aspectos de seguridad como OWASP Top 10, pruebas de API security, ni hardening.

## Objetivos

1. **Crear un plan de testing de seguridad profesional** que cubra API, Web y shared-modules.
2. **Aplicar skills de testing de seguridad** instaladas en `.agents/skills/`:
   - `security-audit` — framework de 7 fases
   - `api-security-testing` — pruebas específicas de API
   - `web-security-testing` — pruebas específicas de web
3. **Ejecutar pruebas de seguridad** antes del deploy a producción.
4. **Documentar hallazgos** en `07-Resultados-Testings.md` del componente.
5. **Proponer remediaciones** para los bugs de seguridad encontrados.

## Alcance

### Incluye
- **API (`api/src/`):**
  - Endpoints: `/api/sorteos`, `/api/sorteos/analizar`, `/api/pagos`, `/api/instagram`, `/api/preview`
  - Configuración: CORS, rate limiting, body size, error handling, headers, helmet
  - Lógica: validación de inputs, autorización, manejo de errores
- **Web (`web/app/`):**
  - Páginas: `/`, `/pago`, `/dashboard`, `/auth/login`
  - Configuración: metadataBase, headers de seguridad, CSP
  - Componentes: validación de inputs, renderizado seguro
- **Shared-modules (`shared-modules/mercadopago/`):**
  - Validación de webhooks
  - Manejo de tokens
  - Configuración de seguridad

### No incluye
- Pruebas de penetración avanzadas (fuera de alcance para MVP)
- Pruebas de infraestructura/cloud (se cubre en módulo 06)
- Pruebas de carga/estrés (se cubre en módulo 07)

## Restricciones

1. **No modificar código sin autorización:** Este módulo solo documenta el plan y los resultados. Las correcciones se implementan en otros módulos.
2. **Respetar el flujo de testing:** Seguir la regla 14 de AGENTS.md: plan → ejecución → resultados → corrección.
3. **Aislar pruebas de seguridad:** No interferir con el entorno de desarrollo local.
4. **Documentar todo:** Todos los hallazgos deben registrarse en el archivo de resultados.
5. **Usar skills instaladas:** Aprovechar las skills de seguridad del proyecto para maximizar cobertura.

## Criterios de Éxito

| Criterio | Métrica |
|----------|---------|
| Plan documentado | `06-Plan-Testings.md` creado con escenarios y criterios |
| Pruebas ejecutadas | Todos los escenarios del plan ejecutados |
| Bugs documentados | Hallazgos registrados en `07-Resultados-Testings.md` |
| Remediation propuesta | Soluciones propuestas para cada bug |
| Sin bloqueos | Pruebas no rompen el entorno de desarrollo |