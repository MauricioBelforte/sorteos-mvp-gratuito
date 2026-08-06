# Diseño — Módulo 08: Testing de Seguridad

**Componente:** 08-Testing-Seguridad  
**Fecha:** 2026-08-05  
**Responsable:** stepfun/step 3.7 (Cline)

---

## Arquitectura de Testing

El módulo implementa un plan de testing de seguridad en 7 fases, basado en las skills instaladas:

```
┌─────────────────────────────────────────────┐
│         FASE 1: Reconocimiento              │
│  - Mapear superficie de ataque              │
│  - Identificar endpoints                    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         FASE 2: Scanning                     │
│  - Verificar CORS                            │
│  - Verificar headers de seguridad            │
│  - Verificar body size limits                │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         FASE 3: API Security Testing         │
│  - Autenticación/Autorización                │
│  - Rate limiting                             │
│  - Input validation                          │
│  - Error handling                            │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         FASE 4: Web Security Testing         │
│  - OWASP Top 10                              │
│  - Security headers                          │
│  - XSS prevention                            │
│  - metadataBase                              │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         FASE 5: Penetration Testing          │
│  - CORS bypass                               │
│  - Race conditions                           │
│  - Body size exhaustion                      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         FASE 6: Security Hardening           │
│  - Proponer remediaciones                    │
│  - Documentar fixes                          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         FASE 7: Reporting                     │
│  - Documentar hallazgos                      │
│  - Clasificar severidad                      │
│  - Generar reporte                           │
└─────────────────────────────────────────────┘
```

## Flujo de Ejecución

1. **Reconocimiento:** Enumerar endpoints y tecnologías
2. **Scanning:** Verificar configuración de seguridad básica
3. **API Testing:** Probar autenticación, rate limiting, validación, errores
4. **Web Testing:** Probar headers, XSS, metadata
5. **Pentest:** Probar bypasses y edge cases
6. **Hardening:** Proponer soluciones
7. **Reporting:** Documentar en `07-Resultados-Testings.md`

## Tests Implementados

### API Security (`api/src/__tests__/security/api-security.spec.ts`)
- CORS: validar orígenes permitidos vs maliciosos
- Rate limiting: 50 requests rápidas, esperar 429
- Body size: enviar 10MB, esperar 413
- Error handling: verificar que no expone stack traces
- Security headers: verificar headers en `/health`

### Web Security (`api/src/__tests__/security/web-security.spec.ts`)
- Security headers: verificar headers en HTML
- MetadataBase: verificar configuración en layout
- XSS: probar reflejo de input malicioso

## Criterios de Aceptación

| Fase | Criterio | Método |
|------|----------|--------|
| 1 | Superficie mapeada | Lista de endpoints |
| 2 | Configuración auditada | Headers verificados |
| 3 | Vulnerabilidades API documentadas | Tests ejecutados |
| 4 | Vulnerabilidades Web documentadas | Tests ejecutados |
| 5 | Proof-of-concept capturado | Logs de consola |
| 6 | Remediaciones propuestas | Archivo de resultados |
| 7 | Reporte generado | 07-Resultados-Testings.md |

## Estado Actual

- **Fases 1-4:** Completadas
- **Fases 5-7:** Parcialmente completadas (reporting documentado, hardening pendiente)
- **Tests:** 8 total, 3 pasaron, 5 fallaron
- **Bugs confirmados:** 5 (B-01, B-03, B-06, B-07, B-08)

## Dependencias

- `jest` — Framework de testing
- `axios` — Cliente HTTP para tests de integración
- `@types/jest` — Tipos de Jest
- `@types/node` — Tipos de Node.js