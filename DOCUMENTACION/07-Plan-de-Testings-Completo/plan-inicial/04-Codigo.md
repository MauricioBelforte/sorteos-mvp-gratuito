# Código — Plan de Testings Profesional Completo

**Componente:** 07-Plan-de-Testings-Completo  
**Fecha:** 2026-08-04  
**Responsable:** glm + DeepSeek (Cline)

---

## Archivos Creados

### Script de Pruebas
- `api/tests/unit-smoke-test.mjs` — Script autocontenido con 55 pruebas unitarias y de smoke

### Archivos de Test (Jest)
- `api/src/lib/verificacion.spec.ts` — 15 tests del motor de sorteos
- `api/src/lib/sorteos-service.spec.ts` — 11 tests de precios y deduplicación
- `api/src/collectors/parsers/instagram-paste.spec.ts` — 11 tests del parser de Instagram

### Configuración
- `api/jest.config.js` — Configuración de Jest (ts-jest, testMatch `*.spec.ts`)
- `api/package.json` — Dependencias: jest, ts-jest, @types/jest, @golevelup/ts-jest

## Archivos Modificados
- `api/tsconfig.json` — Agregado `"types": ["jest", "node"]`
- `DOCUMENTACION/README.md` — Agregado componente 07
- `Mensajes entre modelos/ESTADO-PARALELO.md` — Tarea #13 agregada

## Funciones/Componentes Clave

### Script unit-smoke-test.mjs
- `generarHashParticipantes()` — Hash SHA-256 de participantes
- `generarHashVerificacion()` — Hash de verificación
- `crearPRNG()` — PRNG determinístico
- `seleccionarSinRepeticion()` — Selección de ganadores sin repetición
- `realizarSorteo()` — Motor de sorteo completo
- `verificarSorteo()` — Verificación de sorteo
- `calcularPrecio()` — Modelo de precios por comentarios
- `deduplicarParticipantes()` — Deduplicación de participantes

## Logs Generados
- `Logs/29-Plan-Testings-Profesional-Completo-2026-08-04_21-15-00.md`

## Resultados
- **Tests ejecutados:** 55 total (unit-smoke-test.mjs) + 37 tests Jest
- **Tests pasaron:** 52/55 (94.5%) + 36/37 (97.3%)
- **Bugs identificados:** 14 (4 altos, 8 medios, 2 bajos)