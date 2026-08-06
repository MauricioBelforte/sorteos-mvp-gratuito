# 06-Plan-Testings — Módulo 08: Testing de Seguridad

**Componente:** 08-Testing-Seguridad  
**Fecha:** 2026-08-05  
**Responsable:** stepfun/step 3.7 (Cline)

---

## Skills Utilizadas

| Skill | Propósito |
|-------|-----------|
| `security-audit` | Framework de 7 fases (reconocimiento → scanning → web testing → API testing → pentest → hardening → reporting) |
| `api-security-testing` | Pruebas específicas de API: CORS, rate limiting, input validation, error handling |
| `web-security-testing` | Pruebas específicas de web: headers, XSS, metadata, DOM |

## Scope de Pruebas

### API (`api/src/`)
- **Endpoints:** `/api/sorteos`, `/api/sorteos/analizar`, `/api/pagos`, `/api/instagram`, `/api/preview`
- **Configuración:** CORS, rate limiting, body size, error handling, security headers
- **Lógica:** validación de inputs, autorización, manejo de errores

### Web (`web/app/`)
- **Páginas:** `/`, `/pago`, `/dashboard`
- **Configuración:** metadataBase, security headers, CSP
- **Componentes:** validación de inputs, renderizado seguro

### Shared-modules (`shared-modules/mercadopago/`)
- **Validación de webhooks**
- **Manejo de tokens**
- **Configuración de seguridad**

## Plan de Pruebas

### Fase 1: Reconocimiento
1. Mapear superficie de ataque de la API
2. Identificar tecnologías y versiones
3. Documentar endpoints expuestos

### Fase 2: Scanning
1. Escanear dependencias en busca de vulnerabilidades conocidas
2. Analizar configuración de CORS
3. Verificar headers de seguridad

### Fase 3: Web Application Testing
1. Probar inyección SQL/NoSQL
2. Probar XSS/HTML injection
3. Probar broken authentication
4. Probar broken access control
5. Probar security misconfiguration

### Fase 4: API Security Testing
1. Enumerar endpoints API
2. Probar authentication/authorization
3. Probar rate limiting
4. Probar input validation
5. Probar error handling

### Fase 5: Penetration Testing
1. Probar CORS bypass
2. Probar body size limits
3. Probar race conditions
4. Probar metadataBase missing

### Fase 6: Security Hardening
1. Proponer fixes para CORS
2. Proponer fixes para rate limiting
3. Proponer fixes para body size
4. Proponer fixes para error handling
5. Proponer fixes para security headers

### Fase 7: Reporting
1. Documentar hallazgos en `07-Resultados-Testings.md`
2. Clasificar por severidad (Alta/Media/Baja)
3. Proponer remediaciones

## Criterios de Éxito

| Criterio | Métrica |
|----------|---------|
| Plan documentado | Este archivo creado |
| Pruebas ejecutadas | Todos los escenarios ejecutados |
| Bugs documentados | Hallazgos en `07-Resultados-Testings.md` |
| Remediation propuesta | Soluciones para cada bug |
| Sin bloqueos | Pruebas no rompen desarrollo |

## Próximos Pasos

1. **Antes de ejecutar:** Revisar este plan y ajustar según necesidades
2. **Durante ejecución:** Seguir las skills `security-audit`, `api-security-testing`, `web-security-testing`
3. **Después de ejecutar:** Documentar resultados y generar log

## Referencias

- `security-audit/SKILL.md` — Framework de 7 fases
- `api-security-testing/SKILL.md` — Pruebas API
- `web-security-testing/SKILL.md` — Pruebas Web
- `DOCUMENTACION/07-Plan-de-Testings-Completo/plan-actual/06-Plan-Testings.md` — Plan anterior
- `DOCUMENTACION/07-Plan-de-Testings-Completo/plan-actual/07-Resultados-Testings.md` — Resultados anteriores (14 bugs)