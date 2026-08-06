# 06 - Plan de Testings: Captura Completa de Comentarios de Instagram

## Objetivo del Plan de Testing

Validar que la nueva implementación (`instagram-v2.ts` con cascada de estrategias) captura significativamente más comentarios que la versión actual, sin romper los flujos existentes.

---

## 1. Tests Unitarios

### 1.1 Parser de Texto Pegado (`parsers/instagram-paste.ts`)

| ID | Escenario | Entrada | Resultado Esperado |
|----|-----------|---------|-------------------|
| U1 | Texto completo del usuario (130+ comentarios) | Texto pegado del request | ≥ 100 participantes con username válido |
| U2 | Username + comentario básico | `karen_etcheverry\n125 sem\n@ailin_1453 @kevin_1495xd` | `{usuario: "karen_etcheverry", comentario: "@ailin_1453 @kevin_1495xd"}` |
| U3 | Username + emoji como comentario | `mirmili2021\n125 sem\n❤️` | `{usuario: "mirmili2021", comentario: "❤️"}` |
| U4 | Username sin comentario (solo timestamp) | `natyy_soria\n126 sem\n?` | `{usuario: "natyy_soria", comentario: "?"}` |
| U5 | Texto con "Foto del perfil de..." | `...Foto del perfil de karen_etcheverry\nkaren_etcheverry\n...` | Ignorar la línea "Foto del perfil de..." |
| U6 | Texto vacío | `""` | `[]` |
| U7 | Texto sin usernames (solo basura) | `"reply\nlike\nme gusta\n125 sem"` | `[]` |
| U8 | Username con underscores y puntos | `_clf.car\n126 sem\n@vasconcelosnatali` | `{usuario: "_clf.car", comentario: "@vasconcelosnatali"}` |
| U9 | Múltiples menciones en un comentario | `silviafinana\n126 sem\n@carolina_83___ @yami_sona` | `{usuario: "silviafinana", comentario: "@carolina_83___ @yami_sona"}` |
| U10 | Deduplicación (mismo usuario, mismo comentario) | 2x `karen_etcheverry\n@ailin_1453` | Solo 1 resultado |

### 1.2 Extractor GraphQL (`strategies/graphql-intercept.ts`)

| ID | Escenario | Entrada | Resultado Esperado |
|----|-----------|---------|-------------------|
| U11 | JSON con formato `xdt_shortcode_media` | JSON mock con estructura moderna | Array de Participante[] con datos correctos |
| U12 | JSON con formato `shortcode_media` | JSON mock con estructura clásica | Array de Participante[] con datos correctos |
| U13 | JSON sin comentarios (response de otro tipo) | `{"data": {"user": {...}}}` | `[]` |
| U14 | JSON inválido / no parseable | `"not json"` | `[]` (sin error) |
| U15 | Excluir al autor del post | JSON con autor "sorteos_cuenta" | No incluir "@sorteos_cuenta" |
| U16 | Edge case: `has_next_page: false` | JSON con `page_info.has_next_page: false` | Detectar fin de paginación |

### 1.3 Deduplicación (`instagram-v2.ts`)

| ID | Escenario | Entrada | Resultado Esperado |
|----|-----------|---------|-------------------|
| U17 | Sin duplicados | 5 participantes únicos | 5 participantes |
| U18 | Duplicados exactos | 3 únicos + 2 duplicados | 3 participantes |
| U19 | Mismo usuario, diferente comentario | "user1\|com1" + "user1\|com2" | 2 participantes (son diferentes) |
| U20 | Case sensitivity | "User1\|com" + "user1\|com" | 1 participante (case insensitive) |

### 1.4 Validación de Username (`esUsernameValido`)

| ID | Escenario | Entrada | Resultado Esperado |
|----|-----------|---------|-------------------|
| U21 | Username normal | `"karen_etcheverry"` | `true` |
| U22 | Username con puntos | `"_clf.car"` | `true` |
| U23 | Username muy corto (2 chars) | `"ab"` | `false` |
| U24 | Username solo números | `"12345"` | `false` |
| U25 | Username con contador (views) | `"1234w"` | `false` |
| U26 | Username válido mínimo (3 chars) | `"abc"` | `true` |
| U27 | Username con triple underscore | `"carolina_83___"` | `true` |

---

## 2. Tests de Integración

### 2.1 Captura de Comentarios (Estrategia Completa)

| ID | Escenario | URL | Sesión | Resultado Esperado |
|----|-----------|-----|--------|-------------------|
| I1 | URL de prueba principal SIN sesión | `https://www.instagram.com/p/C347268uDMm/` | No | ≥ 16 participantes (al menos igualar al actual) |
| I2 | URL de prueba principal CON sesión | `https://www.instagram.com/p/C347268uDMm/` | Sí | ≥ 100 participantes (mejora significativa) |
| I3 | URL de post con pocos comentarios (< 10) | Post reciente con pocos comentarios | No | Capturar todos los visibles |
| I4 | URL de post sin comentarios | Post sin comentarios | No | `[]` |
| I5 | URL inválida de Instagram | `https://www.instagram.com/invalid` | No | Error manejado, `[]` |
| I6 | URL de Reel | URL de un reel público | No | ≥ 1 participante |

### 2.2 Cascada de Estrategias

| ID | Escenario | Condición | Resultado Esperado |
|----|-----------|-----------|-------------------|
| I7 | Estrategia A funciona | GraphQL interceptado correctamente | Retorna sin probar B, C, D |
| I8 | Estrategia A falla, B funciona | Sin GraphQL pero con sesión + API | Retorna después de B |
| I9 | Todas las estrategias automáticas fallan | Sin sesión, API bloqueada | Retorna `[]` (frontend muestra opción manual) |
| I10 | Timeout global (120s) | Post con miles de comentarios | Corta y retorna lo que tenga |

### 2.3 Regresión de Otros Scrapers

| ID | Escenario | Resultado Esperado |
|----|-----------|-------------------|
| I11 | Sorteo de TikTok (URL válida) | Funciona igual que antes |
| I12 | Sorteo de YouTube (URL válida) | Funciona igual que antes |
| I13 | Entrada manual (participantes pegados) | Funciona igual que antes |

---

## 3. Tests de Rendimiento

| ID | Escenario | Métrica | Umbral |
|----|-----------|---------|--------|
| P1 | Captura de 130 comentarios (post de prueba) | Tiempo total | < 120 segundos |
| P2 | Captura de 10 comentarios (post pequeño) | Tiempo total | < 30 segundos |
| P3 | Uso de memoria durante scraping | Heap máximo | < 512 MB |
| P4 | Timeout global respetado | Tiempo real vs timeout configurado | ≤ 125 segundos |

---

## 4. Tests de Casos Límite (Edge Cases)

| ID | Escenario | Resultado Esperado |
|----|-----------|-------------------|
| E1 | Post con comentarios deshabilitados | `[]` sin error |
| E2 | Post de cuenta privada | `[]` sin error |
| E3 | Post eliminado | Error manejado, `[]` |
| E4 | Instagram devuelve 429 (rate limit) | Retry con backoff, o `[]` |
| E5 | Instagram devuelve redirect a login | Detectar y cortar, retornar lo que se tenga |
| E6 | Comentarios con emojis especiales | Capturados correctamente |
| E7 | Comentarios con caracteres especiales (ñ, ü, á) | Capturados correctamente |
| E8 | Comentarios muy largos (> 500 chars) | Truncados a 500 chars |
| E9 | Usuario con badge "Verified" | Username limpio sin "Verified" |
| E10 | Conexión de red lenta (timeout) | Error manejado, `[]` |

---

## 5. Plan de Ejecución

### Orden de Ejecución

1. **Tests Unitarios (U1-U27):** Ejecutar primero, son rápidos y no requieren red.
2. **Tests de Integración (I1-I13):** Requieren acceso a Instagram.
3. **Tests de Rendimiento (P1-P4):** Medir tiempos.
4. **Tests de Edge Cases (E1-E10):** Verificar robustez.

### Herramientas

- **Tests unitarios:** Vitest o Jest (ya disponible en el proyecto)
- **Tests de integración:** Scripts de Node.js que ejecutan `recolectarInstagramV2()`
- **Medición de rendimiento:** `console.time()` + `process.memoryUsage()`

### Criterios de Aprobación

| Categoría | Criterio | Mínimo para aprobar |
|-----------|----------|---------------------|
| Unitarios | Tests pasados | 100% (27/27) |
| Integración | Tests pasados | ≥ 85% (11/13) |
| Rendimiento | Dentro de umbrales | 100% (4/4) |
| Edge Cases | Sin crashes | 100% (10/10) |
| Regresión | TikTok + YouTube funcionan | 100% (2/2) |

### Datos de Test Fijos

Para los tests unitarios del parser (U1-U10), usar el texto exacto proporcionado por el usuario en el request (los ~130 comentarios). Este texto se guardará como fixture en:

```
api/src/collectors/__tests__/fixtures/instagram-comments-paste.txt
```
