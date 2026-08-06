# Diseño — Plan de Testings Profesional Completo

**Componente:** 07-Plan-de-Testings-Completo  
**Fecha:** 2026-08-04  
**Responsable:** glm + DeepSeek (Cline)

---

## Arquitectura de Testing

```
┌─────────────────────────────────────────────────────────┐
│              PLAN DE TESTINGS COMPLETO                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Nivel 1: Compilación                                   │
│  ├── TypeCheck API (tsc --noEmit)                       │
│  ├── TypeCheck Web (tsc --noEmit)                       │
│  └── Build Web (next build)                             │
│                                                         │
│  Nivel 2: Unitarias (script autocontenido)              │
│  ├── Motor de Sorteos (verificacion.ts)                 │
│  ├── Modelo de Precios (sorteos-service.ts)             │
│  ├── Deduplicación (sorteos-service.ts)                  │
│  ├── Parser Manual (instagram-paste.ts)                  │
│  └── Edge Cases del motor                               │
│                                                         │
│  Nivel 3: Integración (pendiente - requiere servidor)   │
│  ├── Endpoints API (curl)                               │
│  └── Contrato Frontend↔Backend                          │
│                                                         │
│  Nivel 4: Edge Cases (parcial - requiere servidor)      │
│  ├── API: URLs inválidas, arrays vacíos, null           │
│  ├── Web: API caída, respuestas null, timeout           │
│  └── Collectors: sin comentarios, sesión corrupta       │
│                                                         │
│  Nivel 5: Smoke/Seguridad (análisis estático)           │
│  ├── CORS, rate limiting, body size                     │
│  ├── Headers de seguridad, error handler                │
│  ├── XSS, inyección SQL                                 │
│  └── Rendimiento (smoke)                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Flujo de Ejecución

1. **Compilación** → TypeCheck API + Web + Build Web
2. **Unitarias** → Script `unit-smoke-test.mjs` (55 pruebas)
3. **Integración** → Pendiente (requiere servidores)
4. **Edge Cases** → Parcial (motor de sorteos OK, API/Web pendiente)
5. **Seguridad** → Análisis estático (14 bugs identificados)

## Archivo de Pruebas

- **Script:** `api/tests/unit-smoke-test.mjs`
- **Tipo:** Autocontenido (funciones copiadas de archivos fuente)
- **Ejecución:** `node api/tests/unit-smoke-test.mjs`
- **Dependencias:** Solo Node.js (crypto module)
- **Resultados:** 52/55 pasaron (94.5%)