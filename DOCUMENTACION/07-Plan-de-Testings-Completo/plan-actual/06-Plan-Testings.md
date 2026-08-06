# Plan de Testings Profesional Completo — Sorteosypromos

**Componente:** 07-Plan-de-Testings-Completo  
**Fecha:** 2026-08-04  
**Responsable:** glm + DeepSeek (Cline)
**Alcance:** api/, web/, shared-modules/  
**Objetivo:** Identificar bugs y fallos antes de la primera prueba manual del usuario

---

## 1. Estrategia de Testing

Este plan cubre 5 niveles de testing, alineados con la regla 14 de AGENTS.md:

| Nivel | Descripción | Herramienta |
|-------|-------------|-------------|
| **1. Compilación** | TypeCheck + Build sin errores | `tsc --noEmit`, `next build` |
| **2. Unitarias** | Funciones puras aisladas (sorteo, deduplicación, parser, cuota) | Scripts Node.js ad-hoc |
| **3. Integración** | Endpoints API + contrato frontend↔backend | curl/HTTP directo |
| **4. Edge Cases** | Casos límite (arrays vacíos, null, URLs inválidas) | Scripts Node.js ad-hoc |
| **5. Smoke/Seguridad** | CORS, rate limiting, manejo de errores, headers | curl + análisis estático |

---

## 2. Pruebas de Compilación (Nivel 1)

### 2.1 TypeCheck API
- **Comando:** `cd api; node node_modules/typescript/bin/tsc --noEmit`
- **Criterio de éxito:** Sin errores de tipos
- **Archivo:** `api/tsconfig.json`

### 2.2 TypeCheck Web
- **Comando:** `cd web; node node_modules/typescript/bin/tsc --noEmit`
- **Criterio de éxito:** Sin errores de tipos
- **Archivo:** `web/tsconfig.json`

### 2.3 Build Frontend
- **Comando:** `cd web; npm run build`
- **Criterio de éxito:** Build exitoso sin errores de compilación
- **Archivo:** `web/package.json`

---

## 3. Pruebas Unitarias (Nivel 2)

### 3.1 Motor de Sorteos (`api/src/lib/sorteos-service.ts`)

| ID | Escenario | Entrada | Salida Esperada | Criterio |
|----|-----------|---------|-----------------|----------|
| U-SORT-01 | Sorteo con 10 participantes, 1 ganador | 10 participantes, 1 ganador | 1 ganador del pool | Ganador ∈ pool |
| U-SORT-02 | Sorteo con 10 participantes, 3 ganadores | 10 participantes, 3 ganadores | 3 ganadores únicos | Sin repetición |
| U-SORT-03 | Sorteo con 10 participantes, 5 ganadores + 2 suplentes | 10, 5, 2 | 5 + 2 únicos | Sin repetición total |
| U-SORT-04 | Ganadores > participantes | 5 participantes, 10 ganadores | Error o límite al pool | No excede pool |
| U-SORT-05 | Sorteo con 0 participantes | 0 participantes | Error 422 | No se sortea |
| U-SORT-06 | Sorteo con 1 participante | 1 participante, 1 ganador | 1 ganador | Único participante |
| U-SORT-07 | Hash de verificación consistente | Mismo input + seed | Mismo hash | Determinístico |
| U-SORT-08 | Exclusión del autor | Autor en pool | Autor no ganador | Autor excluido |

### 3.2 Deduplicación (`api/src/collectors/instagram-v2.ts`)

| ID | Escenario | Entrada | Salida Esperada | Criterio |
|----|-----------|---------|-----------------|----------|
| U-DEDUP-01 | Deduplicación con duplicados exactos | 2 pares idénticos | 1 par | `usuario\|comentario` como clave |
| U-DEDUP-02 | Deduplicación case-insensitive usuario | "User" y "user" | 1 par | `toLowerCase()` en usuario |
| U-DEDUP-03 | Deduplicación case-insensitive comentario | "Hola" y "HOLA" | **BUG: 2 pares** | `toLowerCase()` NO aplicado a comentario |
| U-DEDUP-04 | Deduplicación vacía | [] | [] | No crashea |

### 3.3 Parser Manual (`api/src/collectors/parsers/instagram-paste.ts`)

| ID | Escenario | Entrada | Salida Esperada | Criterio |
|----|-----------|---------|-----------------|----------|
| U-PARSE-01 | Texto con @usuario | "@user comentario" | `[{usuario:"user", comentario:"comentario"}]` | Parseo correcto |
| U-PARSE-02 | Texto sin @ | "comentario solo" | `[{usuario:"Anónimo 1", comentario:"comentario solo"}]` | Anónimo N |
| U-PARSE-03 | Texto vacío | "" | [] | No crashea |
| U-PARSE-04 | Múltiples líneas | "@a hola\n@b chau" | 2 pares | Una línea = un par |
| U-PARSE-05 | Línea con solo @ | "@" | `[{usuario:"", comentario:""}]` o Anónimo | Edge case |

### 3.4 Cuota y Pases (`api/src/lib/cuota.ts`, `api/src/lib/pases.ts`)

| ID | Escenario | Entrada | Salida Esperada | Criterio |
|----|-----------|---------|-----------------|----------|
| U-CUOTA-01 | Cuota disponible | usosMes=0, cuotaMensual=45 | `requierePago: false` | Permite sorteo |
| U-CUOTA-02 | Cuota agotada | usosMes=45, cuotaMensual=45 | `requierePago: true, motivo: 'cuota'` | Bloquea sorteo |
| U-CUOTA-03 | Cuota hoy agotada | cuotaHoy=0 | `requierePago: true` | Bloquea hoy |
| U-PASE-01 | Pase válido no usado | paseId válido, usadoEnSorteoId=null | `paseAprobado: true` | Permite sorteo |
| U-PASE-02 | Pase ya consumido | paseId con usadoEnSorteoId | `pase_invalido` | Bloquea reuso |
| U-PASE-03 | Pase inexistente | paseId="invalid" | `pase_invalido` | Bloquea |

---

## 4. Pruebas de Integración (Nivel 3)

### 4.1 Endpoints API

| ID | Endpoint | Método | Escenario | Status Esperado |
|----|----------|--------|-----------|-----------------|
| I-API-01 | `/api/sorteos/analizar` | POST | URL YouTube válida | 200 + participantes |
| I-API-02 | `/api/sorteos/analizar` | POST | URL inválida | 400 |
| I-API-03 | `/api/sorteos/analizar` | POST | URL sin comentarios | 200 + 0 participantes |
| I-API-04 | `/api/sorteos` | POST | Sorteo con participantes manuales | 201 + ganadores |
| I-API-05 | `/api/sorteos` | POST | Sorteo sin participantes | 422 |
| I-API-06 | `/api/sorteos` | POST | Sorteo con pase válido | 201 + pase consumido |
| I-API-07 | `/api/sorteos` | POST | Sorteo con pase consumido | 402 |
| I-API-08 | `/api/sorteos/cuota` | GET | Cuota disponible | 200 + `{cuotaMensual, usosMes}` |
| I-API-09 | `/api/sorteos/instagram/estado` | GET | Sin sesión guardada | 200 + `sesion: 'anonima'` |
| I-API-10 | `/api/pagos/pase` | POST | Crear preferencia de pago | 201 + init_point |
| I-API-11 | `/api/pagos/pase/:id` | GET | Pase existente | 200 + estado |
| I-API-12 | `/api/pagos/verificar` | POST | Verificar pase | 200 + resultado |

### 4.2 Contrato Frontend↔Backend

| ID | Escenario | Frontend envía | Backend responde | Criterio |
|----|-----------|----------------|------------------|----------|
| I-CONTRACT-01 | Análisis de publicación | `{url, redSocial}` | `{participantes, cantidad, sesion}` | Contrato OK |
| I-CONTRACT-02 | Crear sorteo | `{url, ganadores, suplentes, participantesManuales?}` | `{id, ganadores, suplentes, hash}` | Contrato OK |
| I-CONTRACT-03 | Cuota agotada | Sorteo sin pase | `{requierePago: true, motivo, precio}` | 402 + body |
| I-CONTRACT-04 | Pago de pase | `{paseId}` en sorteo | Sorteo creado + pase consumido | 201 |

---

## 5. Pruebas de Edge Cases (Nivel 4)

### 5.1 API

| ID | Escenario | Entrada | Comportamiento Esperado |
|----|-----------|---------|------------------------|
| E-API-01 | URL vacía | `url: ""` | 400 + mensaje de error |
| E-API-02 | URL no es red social | `url: "https://google.com"` | 400 + "red social no soportada" |
| E-API-03 | Ganadores = 0 | `ganadores: 0` | 400 + "mínimo 1 ganador" |
| E-API-04 | Ganadores > 10 | `ganadores: 11` | 400 + "máximo 10" |
| E-API-05 | Suplentes > 10 | `suplentes: 11` | 400 + "máximo 10" |
| E-API-06 | Participantes manuales vacíos | `participantesManuales: []` | 422 |
| E-API-07 | Body sin Content-Type | POST sin header | 400 |
| E-API-08 | JSON malformado | body inválido | 400 |
| E-API-09 | Participantes con caracteres especiales | `@user "comentario con <script>"` | Sin XSS |
| E-API-10 | URL extremadamente larga | url de 10KB | 400 o manejo graceful |

### 5.2 Frontend

| ID | Escenario | Condición | Comportamiento Esperado |
|----|-----------|-----------|------------------------|
| E-WEB-01 | API caída | fetch falla | Mensaje de error al usuario |
| E-WEB-02 | Respuesta null de API | `data: null` | No crashea (BUG en /pago) |
| E-WEB-03 | Participantes vacíos | `participantes: []` | Botón sortear deshabilitado |
| E-WEB-04 | Timeout de scraping | fetch > 60s | Spinner + mensaje de espera |
| E-WEB-05 | localStorage sin datos | /pago sin `paseId` en storage | Redirección o mensaje |
| E-WEB-06 | Red lenta | fetch > 10s | Spinner visible |
| E-WEB-07 | Doble click en sortear | 2 clicks rápidos | Solo 1 sorteo (debounce) |

### 5.3 Collectors

| ID | Escenario | Condición | Comportamiento Esperado |
|----|-----------|-----------|------------------------|
| E-COL-01 | Instagram sin comentarios | Post con 0 comentarios | [] + no crashea |
| E-COL-02 | YouTube sin comentarios | Video con 0 comentarios | [] + no crashea |
| E-COL-03 | TikTok sin comentarios | Video con 0 comentarios | [] + no crashea |
| E-COL-04 | Sesión IG corrupta | `.instagram-session.json` inválido | Fallback a anónimo |
| E-COL-05 | Playwright no instalado | chromium no encontrado | Error graceful |
| E-COL-06 | Timeout de Playwright | page.goto > 30s | Error + cleanup |
| E-COL-07 | URL de Instagram inválida | `https://instagram.com/invalido` | Error o [] |

---

## 6. Pruebas de Smoke/Seguridad (Nivel 5)

### 6.1 Seguridad

| ID | Escenario | Comando/Verificación | Criterio de Éxito |
|----|-----------|---------------------|-------------------|
| S-SEC-01 | CORS sin restricciones | `curl -H "Origin: https://evil.com" -I http://localhost:4000` | `Access-Control-Allow-Origin: *` (BUG: alta) |
| S-SEC-02 | Sin rate limiting | 100 requests en 1s a `/api/sorteos` | Sin bloqueo (BUG: alta) |
| S-SEC-03 | Sin límite de body | POST con body de 10MB | Sin rechazo (BUG: media) |
| S-SEC-04 | Sin headers de seguridad | `curl -I http://localhost:4000` | Sin helmet (BUG: media) |
| S-SEC-05 | Sin error handler global | Forzar error en endpoint | Stack trace expuesto (BUG: media) |
| S-SEC-06 | XSS en comentarios | `@user <script>alert(1)</script>` | Sin ejecución de script |
| S-SEC-07 | Inyección en URL | `url: "'; DROP TABLE;"` | Sin inyección SQL |

### 6.2 Manejo de Errores

| ID | Escenario | Condición | Comportamiento Esperado |
|----|-----------|-----------|------------------------|
| S-ERR-01 | DB caída | Prisma no conecta | 500 + mensaje genérico |
| S-ERR-02 | Playwright falla | chromium no abre | Error + cleanup de procesos |
| S-ERR-03 | Apify falla | Token inválido o timeout | Fallback a Estrategia G |
| S-ERR-04 | MercadoPago falla | Token inválido | 401/403 + mensaje |
| S-ERR-05 | Webhook MP sin firma | POST /webhook sin header | 400 |
| S-ERR-06 | Webhook MP firma inválida | POST /webhook con firma mala | 401 |

### 6.3 Rendimiento (Smoke)

| ID | Escenario | Criterio | Límite |
|----|-----------|----------|--------|
| S-PERF-01 | Sorteo con 100 participantes | < 1s | 1000ms |
| S-PERF-02 | Sorteo con 1000 participantes | < 2s | 2000ms |
| S-PERF-03 | Deduplicación de 500 pares | < 500ms | 500ms |
| S-PERF-04 | Build de frontend | < 60s | 60000ms |
| S-PERF-05 | Arranque de API | < 5s | 5000ms |

---

## 7. Bugs Identificados (Análisis Estático)

### 7.1 Bugs Críticos/Altos

| ID | Archivo | Línea | Bug | Severidad |
|----|---------|-------|-----|-----------|
| B-01 | `api/src/index.ts` | 13 | CORS sin restricciones (`cors()`) | Alta |
| B-02 | `api/src/index.ts` | 29-36 | Race condition en `setInterval` de cola | Alta |
| B-03 | `api/src/index.ts` | — | Sin rate limiting en ningún endpoint | Alta |
| B-04 | `web/app/pago/page.tsx` | 39 | TypeError por respuesta null (`data.estado`) | Alta |

### 7.2 Bugs Medios

| ID | Archivo | Línea | Bug | Severidad |
|----|---------|-------|-----|-----------|
| B-05 | `api/src/index.ts` | 14 | Sin límite de body size (`express.json()`) | Media |
| B-06 | `api/src/index.ts` | — | Sin middleware de manejo de errores global | Media |
| B-07 | `api/src/index.ts` | — | Sin helmet ni headers de seguridad | Media |
| B-08 | `web/app/layout.tsx` | 4-19 | Falta `metadataBase` en metadata | Media |
| B-09 | `api/src/collectors/instagram-v2.ts` | 28 | Deduplicación inconsistente (comentario sin `toLowerCase()`) | Media |
| B-10 | `api/src/collectors/instagram-v2.ts` | 84-97 | Fallback de lanzamiento sin try/catch | Media |
| B-11 | `api/src/collectors/instagram-v2.ts` | 101 | `storageState` sin validación de contenido | Media |
| B-12 | `api/src/collectors/instagram-v2.ts` | 133 | Sin validación de URL antes de `page.goto()` | Media |

### 7.3 Bugs Bajos

| ID | Archivo | Línea | Bug | Severidad |
|----|---------|-------|-----|-----------|
| B-13 | `web/app/page.tsx` | 18 | Contraste de color insuficiente (`text-gray-600`) | Baja |
| B-14 | `web/app/layout.tsx` | 2 | Imports muertos (`generateOpenGraph`, `generateTwitterCard`) | Baja |

---

## 8. Gaps de Testings Existentes

### 8.1 Componente 01-Backend-API
- **Plan:** 18 pruebas planificadas (unitarias, integración, edge cases, errores)
- **Resultados:** Solo análisis estático, NO ejecución real
- **Gaps:** Timeout de scraping, conexión DB fallida, rate limiting, CORS

### 8.2 Componente 02-Frontend-Web
- **Plan:** Pruebas estáticas de componentes
- **Resultados:** Análisis estático, renderizado de mocks
- **Gaps:** Pruebas dinámicas con API real, estados de carga, manejo de errores

### 8.3 Componente 05-Mejoras-UI
- **Plan:** Pruebas de flujo premium (wizard, ruleta, resultados)
- **Resultados:** Build OK, renderizado OK
- **Gaps:** Pruebas visuales de animación, responsive, accesibilidad

### 8.4 Componente 06-Mejoras-Backend-Produccion
- **Plan:** Pruebas planificadas pero no ejecutadas
- **Resultados:** No ejecutadas
- **Gaps:** Todas las pruebas dinámicas pendientes

---

## 9. Criterios de Éxito Global

| Criterio | Meta | Estado |
|----------|------|--------|
| TypeCheck API sin errores | 0 errores | ✅ |
| TypeCheck Web sin errores | 0 errores | ✅ |
| Build Web exitoso | Sin errores | ⏳ Pendiente |
| Bugs críticos corregidos | 0 bugs críticos | ⏳ Pendiente |
| Bugs altos corregidos | 0 bugs altos | ⏳ Pendiente |
| Pruebas unitarias ejecutadas | 100% | ⏳ Pendiente |
| Pruebas de integración ejecutadas | 100% | ⏳ Pendiente |
| Edge cases verificados | 100% | ⏳ Pendiente |
| Pruebas de seguridad ejecutadas | 100% | ⏳ Pendiente |

---

## 10. Herramientas y Comandos

```bash
# TypeCheck API
cd api; node node_modules/typescript/bin/tsc --noEmit

# TypeCheck Web
cd web; node node_modules/typescript/bin/tsc --noEmit

# Build Web
cd web; npm run build

# Arrancar API
cd api; npm run dev

# Arrancar Web
cd web; npm run dev

# Probar endpoint
curl -X POST http://localhost:4000/api/sorteos/analizar -H "Content-Type: application/json" -d '{"url":"https://youtube.com/watch?v=..."}'

# Verificar cuota
curl http://localhost:4000/api/sorteos/cuota

# Verificar CORS
curl -H "Origin: https://evil.com" -I http://localhost:4000
```

---

## 11. Orden de Ejecución

1. ✅ TypeCheck API (sin errores)
2. ✅ TypeCheck Web (sin errores)
3. ⏳ Build Web
4. ⏳ Pruebas unitarias (motor de sorteos, deduplicación, parser, cuota)
5. ⏳ Pruebas de integración (endpoints API)
6. ⏳ Edge cases (URLs inválidas, arrays vacíos, null)
7. ⏳ Pruebas de seguridad (CORS, rate limiting, XSS)
8. ⏳ Pruebas de rendimiento (smoke)
9. ⏳ Documentar resultados en `07-Resultados-Testings.md`