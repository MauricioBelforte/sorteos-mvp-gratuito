# 02 - Análisis: Captura Completa de Comentarios de Instagram

## Análisis del Problema Actual

### ¿Por qué el scraper actual solo captura ~16 comentarios?

Analizando el código de `api/src/collectors/instagram.ts`, el flujo actual es:

```
1. Lanzar navegador Playwright (headless)
2. Navegar a la URL del post
3. Obtener shortcode → mediaId
4. Intentar API REST: GET /api/v1/media/{mediaId}/comments/?count=200&max_id=...
5. Si la API no devuelve datos → fallback al DOM (modal + "load more")
6. Retornar Participante[]
```

**El problema está en el paso 4**: La función `fetchApiDesdeNode()` hace un `fetch()` directo desde Node.js, NO desde el navegador. Esto tiene 2 problemas críticos:

#### Problema 1: TLS Fingerprinting
- Instagram identifica que el request viene de Node.js (no de un browser real) por el TLS handshake.
- Aunque se copian las cookies y headers del navegador, la "huella digital" de la conexión TCP/TLS es diferente.
- Instagram responde con datos parciales o vacíos.

#### Problema 2: Login Wall para Paginación
- Sin sesión activa, la API REST de Instagram devuelve los primeros ~16-24 comentarios y luego `next_max_id: null`.
- Instagram deliberadamente limita la paginación para usuarios no autenticados.
- El fallback DOM también falla porque "Load more comments" redirige al login.

#### Problema 3: CSP del navegador
- El código comenta (línea 115-116): _"los fetch desde la página fallan porque Instagram los intercepta con CSP"_.
- Esto es parcialmente incorrecto: los fetch DESDE el contexto del navegador SÍ funcionan si se usan las cookies correctas. El problema real es que el `fetch` se hace desde Node.js.

### Diagrama del Flujo Actual (Fallido)

```
┌─────────────────────────────────────────────────┐
│  Playwright Browser (headless)                   │
│  ┌─────────────────────────────────────────────┐ │
│  │ page.goto(instagramURL)                     │ │
│  │ → Carga el HTML del post                    │ │
│  │ → Obtiene cookies de sesión                 │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────┬───────────────────┘
                              │
                              │ Cookies + Headers
                              ▼
┌─────────────────────────────────────────────────┐
│  Node.js fetch() (FUERA del browser)             │
│  → TLS fingerprint de Node.js ❌                 │
│  → Instagram detecta bot ❌                      │
│  → Responde con ~16 comentarios y max_id=null    │
└─────────────────────────────────────────────────┘
```

---

## Análisis de Alternativas (5 Estrategias)

### Estrategia A: Intercepción de GraphQL desde el Navegador (⭐ RECOMENDADA)

#### Concepto
En lugar de hacer fetch desde Node.js, **dejar que el navegador haga las requests** de forma natural (scroll + click "load more") y **interceptar las respuestas GraphQL** que Instagram envía.

#### Cómo funciona
1. Registrar un listener `page.on('response')` ANTES de navegar.
2. Navegar al post.
3. Abrir el modal de comentarios.
4. Scrollear/click "load more" en un loop.
5. Cada vez que Instagram responde con GraphQL JSON, el listener captura los comentarios.
6. Cuando `has_next_page: false`, terminar.

#### Ventajas
- ✅ **Las requests las hace el browser real** → No hay TLS fingerprinting.
- ✅ **Instagram no puede distinguirlo de un humano** que scrollea comentarios.
- ✅ Los datos vienen en JSON estructurado (username + texto + timestamp).
- ✅ No requiere sesión para posts públicos (los primeros comentarios cargan sin login).
- ✅ Con sesión, carga TODOS los comentarios.

#### Desventajas
- ⚠️ La estructura del JSON puede cambiar (Instagram rota `doc_id` cada 2-4 semanas).
- ⚠️ Sin sesión, Instagram limita la paginación (pero más que la API REST directa).
- ⚠️ Más lento que una API directa (requiere scroll real).

#### Dificultad: Media
#### Mantenimiento: Medio (monitorear cambios en la estructura GraphQL)

---

### Estrategia B: API REST con Sesión + Fetch DENTRO del Browser

#### Concepto
Mantener la estrategia actual de API REST, pero hacer el `fetch()` **DENTRO del navegador** (no desde Node.js), eliminando el problema de TLS fingerprinting.

#### Cómo funciona
1. Navegar al post con sesión activa.
2. Ejecutar `page.evaluate(() => fetch('/api/v1/media/{id}/comments/?count=200'))` dentro del navegador.
3. Los requests salen con las cookies Y el TLS fingerprint del browser real.
4. Paginar con `max_id` hasta agotar.

#### Ventajas
- ✅ Soluciona el problema de TLS fingerprinting.
- ✅ Reutiliza el código existente con cambios mínimos.
- ✅ Rápido (requests directos sin scrollear).

#### Desventajas
- ❌ **REQUIERE sesión activa** (sin login, la API devuelve pocos comentarios igualmente).
- ⚠️ Instagram puede bloquear los fetch en página por CSP (Content Security Policy).
- ⚠️ Riesgo de ban si se detecta un patrón de scraping.

#### Solución al CSP
- Usar `page.route()` para interceptar las requests y reescribir headers.
- O usar `page.evaluate()` con `XMLHttpRequest` en vez de `fetch`.

#### Dificultad: Baja
#### Mantenimiento: Bajo

---

### Estrategia C: DOM Scraping con Scroll Mejorado + Auto-Scroll del Modal

#### Concepto
Mejorar drásticamente el fallback DOM actual para que:
1. Scrollee de forma más realista (velocidad variable, pausas humanas).
2. Use el `IntersectionObserver` para detectar cuándo cargan nuevos comentarios.
3. Extraiga datos del DOM de forma más robusta.

#### Cómo funciona
1. Navegar al post.
2. Abrir el modal de comentarios (o scrollear en la página inline).
3. Scrollear hacia abajo con movimiento suave + delays aleatorios.
4. Detectar nuevos nodos DOM que aparecen (MutationObserver).
5. Extraer username + texto de cada nuevo comentario.
6. Continuar hasta que no haya más botón "load more".

#### Ventajas
- ✅ No depende de endpoints internos de Instagram.
- ✅ Es la técnica más resiliente a cambios de API.
- ✅ Funciona incluso si Instagram cambia sus endpoints GraphQL/REST.

#### Desventajas
- ❌ Sin sesión, el "load more" redirige al login (limitado a ~16-24 comentarios visibles).
- ⚠️ Es el método más lento de todos.
- ⚠️ El parsing del DOM es frágil (Instagram ofusca clases CSS).
- ⚠️ Puede tener problemas con comentarios duplicados.

#### Dificultad: Media
#### Mantenimiento: Alto (cambios frecuentes en el HTML)

---

### Estrategia D: Servicio Externo (Apify, ScrapFly, EnsembleData)

#### Concepto
Delegar la captura de comentarios a un servicio especializado que ya resuelve los problemas de proxies, fingerprinting y paginación.

#### Opciones evaluadas

| Servicio | Free Tier | Precio Base | Comentarios |
|----------|-----------|-------------|-------------|
| **Apify** | 5 USD/mes créditos | ~0.25 USD/1000 resultados | Actor "Instagram Comment Scraper" |
| **ScrapFly** | 1000 requests/mes | 0.001 USD/request | API con bypass anti-bot |
| **EnsembleData** | 100 requests/mes | 0.005 USD/request | API especializada en Instagram |
| **Bright Data** | Trial gratuito | Caro para MVP | Enterprise-grade |

#### Ventajas
- ✅ **Solución "funciona siempre"**: los servicios actualizan sus scrapers cuando Instagram cambia.
- ✅ Cero mantenimiento por nuestra parte.
- ✅ Manejan proxies, fingerprinting, rate limiting automáticamente.
- ✅ APIs simples de consumir.

#### Desventajas
- ❌ **Costo monetario** (incluso el free tier se agota rápido con sorteos populares).
- ❌ Dependencia de un tercero (si el servicio cae, no hay sorteo).
- ⚠️ Latencia adicional (la request va a su infraestructura y luego a Instagram).
- ⚠️ Posibles problemas con datos personales (GDPR si aplica).

#### Dificultad: Baja
#### Mantenimiento: Muy bajo

---

### Estrategia E: Entrada Manual Mejorada (UX de Pegado Inteligente)

#### Concepto
Si todas las estrategias automáticas fallan, **mejorar dramáticamente la UX** para que el usuario pueda pegar los comentarios manualmente de forma rápida y precisa.

#### Cómo funciona
1. Ofrecer un botón "Pegar comentarios manualmente" en la UI.
2. El usuario selecciona y copia los comentarios directamente desde Instagram (web o app).
3. El sistema parsea el texto pegado, extrayendo automáticamente usernames y comentarios.
4. Detectar el formato de Instagram (username + timestamp + texto + botones de UI) y limpiarlo.
5. Mostrar preview de los participantes extraídos para validación.

#### Parser inteligente que detecta patrones como:
```
karen_etcheverry\n125 sem\n@ailin_1453 @kevin_1495xd\n
mirmili2021\n125 sem\n❤️\n
```

#### Ventajas
- ✅ **Siempre funciona**: no depende de APIs ni scrapers.
- ✅ Cero mantenimiento técnico.
- ✅ El usuario ve exactamente qué comentarios se incluyeron.
- ✅ Funciona para CUALQUIER red social (no solo Instagram).

#### Desventajas
- ❌ Requiere intervención manual del usuario.
- ⚠️ El usuario puede copiar de forma incompleta.
- ⚠️ El formato del texto pegado puede variar entre navegadores y dispositivos.
- ⚠️ Para publicaciones con miles de comentarios, es tedioso.

#### Dificultad: Baja
#### Mantenimiento: Muy bajo

---

## Decisión Recomendada: Cascada de Estrategias

Implementar un **sistema de cascada** donde se intenten las estrategias en orden:

```
┌────────────────────────────────────────┐
│ 1. Estrategia A: GraphQL Interception  │ ← Con o sin sesión
│    ¿Obtuvo ≥ 80% de comentarios?       │
│    SÍ → return participantes           │
│    NO ↓                                │
├────────────────────────────────────────┤
│ 2. Estrategia B: API REST in-browser   │ ← Solo con sesión
│    ¿Obtuvo ≥ 80% de comentarios?       │
│    SÍ → return participantes           │
│    NO ↓                                │
├────────────────────────────────────────┤
│ 3. Estrategia C: DOM Scroll mejorado   │ ← Fallback universal
│    ¿Obtuvo datos?                      │
│    SÍ → return participantes           │
│    NO ↓                                │
├────────────────────────────────────────┤
│ 4. Estrategia D: Servicio externo      │ ← Si está configurado
│    ¿Obtuvo datos?                      │
│    SÍ → return participantes           │
│    NO ↓                                │
├────────────────────────────────────────┤
│ 5. Estrategia E: UI manual mejorada    │ ← Siempre disponible
│    El usuario pega los comentarios     │
│    → return participantes              │
└────────────────────────────────────────┘
```

**Prioridad de implementación:**
1. **Fase 1 (inmediata):** Estrategia A (GraphQL Interception) + Estrategia E (manual mejorado)
2. **Fase 2 (corto plazo):** Estrategia B (API REST in-browser) + Estrategia C (DOM mejorado)
3. **Fase 3 (si es necesario):** Estrategia D (servicio externo como fallback de emergencia)
