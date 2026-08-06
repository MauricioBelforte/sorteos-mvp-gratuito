# 04 - Código - Módulo de Mejoras UI (plan-actual)

## Archivos Involucrados

### Backend (api/)
| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `src/lib/preview.ts` | NUEVO | Helper `extraerImagenPublicacion(url, redSocial)`: YouTube → thumbnail `img.youtube.com/vi/ID/hqdefault.jpg`; Instagram/TikTok → fetch HTML + regex og:image (con timeout 8s) |
| `src/routes/preview.ts` | NUEVO/MODIFICADO | `POST /api/sorteos/analizar`: valida red → recolecta o parsea manuales → imagen → precio. Soporta `participantesManuales` (la URL no es obligatoria en modo manual) |
| `src/index.ts` | MODIFICADO | Se montó `previewRoutes` en `/api/sorteos` |
| `src/collectors/types.ts` | NUEVO | Interfaz compartida `Participante { usuario, comentario }` |
| `src/collectors/index.ts` | MODIFICADO | `recolectarComentarios(): Promise<Participante[]>` + `parsearParticipantesManuales(lineas)` (línea con `@usuario texto` → par; sin `@` → `Anónimo N` + texto) + desambiguación de usuarios repetidos |
| `src/collectors/instagram.ts` | REESCRITO | Estrategias: (1) mediaId por regex HTML → API interna de comentarios (`api/v1/media/{id}/comments/`) fetch desde Node con cookies del navegador; (2) fallback DOM del modal (autor + comentario por ancestro común, con filtro de basura de UI); **excluye al autor de la publicación** (`obtenerAutorInstagram` vía og:url / twitter:title / header DOM); IG bloquea la API sin login → normalmente devuelve [] |
| `src/collectors/youtube.ts` | REESCRITO | Pares (autor + texto) por `ytd-comment-thread-renderer`, scrollIntoView sobre `ytd-comments` para activar lazy-load, filtro del hilo fijado de estadísticas, **excluye al canal del video** (`ytd-video-owner-renderer a#text`) |
| `src/collectors/tiktok.ts` | REESCRITO | Pares (autor + texto) por `[data-e2e="comment-item"]`, **excluye al autor del video** (`[data-e2e="video-author-uniqueid"]`) |
| `src/routes/sorteos.ts` | MODIFICADO | POST /sorteos: acepta `participantesManuales`; usernames = comentarios.map(c => c.usuario); 422 si 0 participantes; limita ganadores/suplentes a la cantidad disponible; guarda `comentario` en DB; devuelve `comentarios` en la respuesta |
| `prisma/schema.prisma` | MODIFICADO | Campo `comentario String? @default("")` en modelo `Participante` (db push aplicado) |
| `tsconfig.json` | CORREGIDO | `ignoreDeprecations: "6.0"` → `"5.0"` (valor inválido que bloqueaba `tsc --noEmit`) |

### Frontend (web/)
| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `lib/sorteos.ts` | NUEVO/MODIFICADO | `REDES_SOCIALES`, `detectarRedSocial()`, `getRedInfo()`, interfaz `Participante`, `analizarPublicacion(url, participantesManuales?)`, `crearSorteo({... , participantesManuales?})` |
| `components/features/SorteoWizard.tsx` | NUEVO/MODIFICADO | Flujo 2 pasos + **modo manual**: toggle "¿La publicación no se analiza? Pegá los comentarios manualmente" → textarea (una línea por comentario) → analizar/sortear con `participantesManuales`; adjunta `comentarios` al resultado para mostrar el comentario del ganador |
| `components/features/RuletaGanadores.tsx` | NUEVO/MODIFICADO | Acepta `(string \| Participante)[]`, normaliza internamente; muestra `@usuario`; al frenar muestra el comentario del ganador ("Su comentario") |
| `components/features/ResultCard.tsx` | MODIFICADO | Muestra `@usuario` y el comentario de cada ganador/suplente (desde `resultado.comentarios`) |
| `app/page.tsx` | MODIFICADO | `<Card hover={false}>` en la card del wizard (se eliminó el hover-translate que molestaba al pegar la URL) |

## Funciones Clave

### `api/src/collectors/instagram.ts`
```typescript
// recolectarInstagram(url, cantidadMaxima, cookieStr): cookieStr (opcional) → context.addCookies() para usar la sesión del usuario
// obtenerMediaId(page, shortcode): regex HTML "media_id" → endpoint web info → __a=1
// extraerComentariosApi(page, mediaId, cantidadMaxima, autorExcluido):
//   fetch desde Node (cookies + csrftoken del navegador, x-ig-app-id) a api/v1/media/{id}/comments/
//   con paginación next_max_id hasta agotar (máx. 100 iteraciones × 200)
// abrirModalComentarios(page) → cargarMasComentariosInstagram(page, autorExcluido, cantidadMaxima):
//   extrae primero los visibles, clic repetido en "Load more comments" con selector estricto,
//   detecta login wall y corta, scroll del modal, corte por estancamiento
// extraerParesDOM(page, autorExcluido): fallback DOM con limpieza de timestamps/botones UI ("LikeReply"),
//   username sin badge "Verified", comentarios emoji válidos (longitud ≥ 2)
// Resultado: sin login → los visibles (~16 máx); con cookies → todos (API paginada)
```

### `api/src/collectors/youtube.ts`
```typescript
// scrollIntoView sobre ytd-comments → espera 5s → scrolls → extrae pares por ytd-comment-thread-renderer
// Loop de 40 ciclos: scrollBy(0,700) + scrollIntoView del último thread + re-extracción (scroll infinito real)
// Filtro: hilo fijado de YouTube (comentario que empieza con "Comments" y contiene %)
```

### `api/src/routes/sorteos.ts` → POST /api/sorteos
```typescript
// Si participantesManuales[] viene → parsearParticipantesManuales (sin scraping)
// Sino → recolectarComentarios(url, redSocial, cookies)
// 0 participantes → 422 con mensaje que sugiere el modo manual
// precio > 0 → { requierePago, cantidadComentarios, precio, moneda }
// Realiza sorteo con usernames (string[]), guarda participantes con su comentario,
// respuesta: { sorteo: { ganadores, suplentes, hashVerificacion, ... }, comentarios: Participante[] }
```

### `web/components/features/SorteoWizard.tsx`
```typescript
// modoManual: toggle + textarea; lineasManuales() → string[] (filtra vacías)
// mostrarCookies/cookiesInstagram: acordeón ámbar (solo Instagram) con instrucciones F12 → Network → copiar Cookie:
// handleAnalizar: analizarPublicacion(url, manuales, cookiesInstagram)
// handleSortear: crearSorteo({ ..., participantesManuales, cookiesInstagram })
```

## Respuestas Verificadas

```json
POST /api/sorteos/analizar { participantesManuales: ["@maria_lopez ¡me apunto!", "Suerte para todos"] }
→ 200 {
  "cantidadComentarios": 2,
  "participantes": [ { "usuario": "maria_lopez", "comentario": "¡me apunto!" }, { "usuario": "Anónimo 2", "comentario": "Suerte para todos" } ],
  "imagen": null, "redSocial": "instagram", "requierePago": false, "precio": 0, "moneda": "ARS"
}

POST /api/sorteos/analizar { urlPublicacion: "https://www.youtube.com/watch?v=aqz-KE-bpKQ", redSocial: "youtube" }
→ 200 { "cantidadComentarios": 19, "participantes": [ { "usuario": "ShinyFilms", "comentario": "I saw this playing on TV's..." }, ... ] }

POST /api/sorteos { urlPublicacion: "...youtube...", redSocial: "youtube", cantidadGanadores: 2, cantidadSuplentes: 1 }
→ 200 { "sorteo": { "ganadores": ["ceweoh", "AshrafAnwer-kk8ft"], "suplentes": ["bigburd875"], "hashVerificacion": "eed58b9a..." }, "comentarios": [ { "usuario": "ceweoh", "comentario": "This Big Chungus for the PS4 gameplay is so good" }, ... ] }
```

## Exclusión del Autor de la Publicación (el que organiza el sorteo)

El autor de la publicación no puede ganar su propio sorteo. Se detecta en cada collector y se excluye del pool:

- **Instagram** → `obtenerAutorInstagram()`: meta `og:url` (`https://www.instagram.com/{autor}/p/...`), fallback `twitter:title` (`(@autor) • Instagram`), fallback header DOM. Se pasa como `autorExcluido` a `extraerComentariosApi` y `extraerParesDOM` (comparación case-insensitive).
- **YouTube** → canal vía `ytd-video-owner-renderer a#text` / `#owner #text a` / `ytd-channel-name #text`.
- **TikTok** → autor vía `[data-e2e="video-author-uniqueid"]` / `h2 a[href^="/@"]`.

**Verificado:** `world_record_egg` (IG) y `Blender` (YT) no aparecen en el pool de participantes.

## Recolección de TODOS los comentarios (carga completa)

### Instagram - `cargarMasComentariosInstagram(page, autorExcluido, cantidadMaxima)`
Carga iterativa en el fallback DOM:
1. **Extrae primero los comentarios ya visibles** — crítico porque sin sesión el clic en "Load more comments" redirige a `/accounts/login` y destruye el DOM del post.
2. Loop (hasta 60 ciclos): detecta login wall ("Log in"/"Iniciar sesión"/"log in to view"/URL de login) y corta; busca el botón con selector estricto (solo `button`/`a`, texto corto ≤60 chars, `aria-label`/`<title>` "load more comments", textos "ver más comentarios"/"+" /"cargar más"); scrollea el modal/página; re-extrae pares y corta tras 3 ciclos sin progreso o al llegar a `cantidadMaxima`.
3. Selector estricto: evita clickear el DIV gigante del login wall (contiene todo el texto de la página y su texto > 60 chars).

### Instagram - Sesión del usuario (cookies) para desbloquear TODO
- `recolectarInstagram(url, cantidadMaxima, cookieStr)` inyecta las cookies pegadas con `context.addCookies()` (dominio `.instagram.com`).
- `extraerComentariosApi()`: paginación completa — loop hasta agotar `next_max_id` (máx. 100 iteraciones × 200 comentarios) en vez de 4 fijas.
- Con sesión: la API interna funciona (trae todos con paginación) y el botón "+" del DOM ya no redirige al login.
- Frontend: acordeón ámbar en `SorteoWizard.tsx` ("¿Ves pocos comentarios? Conectá tu sesión de Instagram") → textarea para pegar el header `Cookie:` → se envía como `cookies` en `/api/sorteos/analizar` y `POST /api/sorteos` (solo si la red es instagram). Solo se usa en memoria, no se persiste.

### Bug corregido en `extraerParesDOM` (descartaba TODO)
El filtro de basura usaba `includes` sobre el texto del ancestro del username, que contiene los botones de UI ("Like", "Reply", "Gusta") → descartaba todos los comentarios en páginas con botones. Corrección:
- Limpia timestamps (`13m`/`2h`/`3d`/`1w`) y etiquetas UI sueltas o pegadas ("LikeReply") con regex `/\b\d{1,3}\s?[mhdw]\b/` y `/(reply|like|...)/gi` antes de validar.
- Quita el badge "Verified" pegado al username (`world_record_eggVerified` → `world_record_egg`), lo que además repara la exclusión del autor.
- Longitud mínima del comentario = 2 (antes 3) para no descartar comentarios emoji ("🥚").

### YouTube - `recolectarYouTube` scroll infinito real
Loop de hasta 40 ciclos: `scrollBy(0, 700)` + `scrollIntoView` del último thread + re-extracción de pares; corta tras 4 ciclos sin crecimiento o al alcanzar `cantidadMaxima` (antes: 5 scrolls fijos).

### TikTok - `recolectarTikTok` carga con clics
Loop de hasta 60 ciclos: clic en "Ver más comentarios"/"Load more comments"/"Ver más" + scroll del `[data-e2e="comment-list"]`; corta tras 3 ciclos sin crecimiento.

## Login Asistido de Instagram (ventana visible, 1 clic)

El usuario no puede seleccionar/copiar los comentarios en Instagram, y el proceso de pegar cookies con F12 es incómodo. Se agregó un flujo de conexión que guarda la sesión real:

### Backend
- **`api/src/routes/instagram.ts`** (nuevo router, montado en `/api/sorteos`):
  - `POST /api/sorteos/instagram/login`: `chromium.launch({ headless: false })` → ventana visible de Chrome → instagram.com → espera hasta 5 min a que el usuario se loguee (`waitForFunction`: la URL deja de ser `/accounts/...`) → detecta el @usuario → `context.storageState({ path: '.instagram-session.json' })` (incluye cookies HttpOnly como sessionid) + `.instagram-session-info.json` (usuario, fecha) → cierra el navegador.
  - `POST /api/sorteos/instagram/logout`: elimina ambos archivos.
  - `GET /api/sorteos/instagram/estado`: `{ conectado, usuario, guardadoEn }`.
- **`api/src/collectors/instagram.ts`**: si no hay `cookieStr` y existe la sesión guardada → `browser.newContext({ storageState: SESSION_PATH })` (usada automáticamente en todos los análisis).
- **`api/src/routes/preview.ts`**: respuesta de `/analizar` con `sesion: 'manual' | 'cookies' | 'guardada' | 'anonima'`.

### Frontend
- **`web/lib/sorteos.ts`**: `estadoInstagram()`, `conectarInstagram()`, `desconectarInstagram()`.
- **`web/components/features/SorteoWizard.tsx`**:
  - Sin sesión: panel ámbar con botón **"Conectar mi cuenta"** + colapsable "O pegá tus cookies manualmente (opción avanzada)".
  - Con sesión: badge verde "@usuario" + botón "Desconectar".
  - `useEffect` consulta `estadoInstagram()` al detectar URL de Instagram.
  - Preview: badge según `preview.sesion` (ámbar si anónima → invita a conectar; verde si hay sesión/cookies).

### Seguridad
- `.gitignore`: `api/.instagram-session.json` y `api/.instagram-session-info.json`.
- ⚠️ El login asistido abre una ventana → solo funciona en el equipo local del usuario (en producción/headless no habrá display).

## Cascada de Estrategias (Propuesta Claude — `instagram-v2.ts`)

Arquitectura modular que reemplaza el flujo fijo por una cascada dinámica (regla 15 AGENTS.md: `instagram.ts` queda intacto como respaldo, solo se le agregaron `export` a las funciones reutilizables). `index.ts` importa `recolectarInstagramV2` con el mismo alias. **Cascada sin sesión: G→A→B→C→F→D** (G primero: es la que captura TODO y A/B/C la ensucian con clics/modal y marcan la IP). **Con sesión: A→B→C→G→F→D** (las API locales con sesión son las más rápidas). **Prioridad a métodos gratuitos:** los locales ($0) primero, luego ScrapFly ($0) y Apify al final (consume los $5/mes del free tier).

### Diagnóstico técnico real (2026-08-02 → 2026-08-03)
- ~~Sin sesión, Instagram NO expone más de ~19 comentarios~~ → **CORREGIDO (Log 19): la causa era la detección de automatización, no la falta de sesión.** Verificado en vivo:
  - Chromium de Playwright (aun headful) o DevTools abierto → login wall / solo ~15-19 comentarios.
  - **Chrome REAL (`channel: 'chrome'`) anónimo → TODOS los top-level (140 únicos de 152)** scrolleando con `mouse.wheel` sobre la **columna derecha de comentarios** del post (x ~ 1000 en viewport 1280; el scroll de la página completa lleva al feed de la cuenta, no a los comentarios).
  - El scroll JS (`window.scrollTo`) NO dispara la carga infinita; el wheel real sí.
  - El SSR varía por A/B: a veces existe el enlace "Ver los 152 comentarios" (abre modal login wall que hay que cerrar con selectores amplios), a veces los comentarios ya vienen inline.
  - `comment_count` del SSR da el total real (152 = top-level + respuestas + autor).

### Estrategias implementadas
| Archivo | Estrategia | Comportamiento |
|---------|-----------|----------------|
| `strategies/graphql-intercept.ts` | A: GraphQL interception | Listener `page.on('response')` captura JSON GraphQL (múltiples paths: `xdt_shortcode_media`/`shortcode_media`/`xdt_media`/`media`) + scroll humanizado del modal/página + clic estricto "Load more" + DOM base; sin sesión da los visibles (~15-19), con sesión suma pages |
| `strategies/api-rest-inbrowser.ts` | B: API REST in-browser | `page.evaluate(() => fetch(url, { credentials: 'include' }))` → TLS fingerprint real de Chromium; pagina `next_max_id` (hasta 100 iteraciones); aborta rápido ante "Failed to fetch" (CSP) o HTML de login wall |
| `strategies/dom-scroll.ts` | C: DOM scroll | Reutiliza `abrirModalComentarios` + `cargarMasComentariosInstagram` (lógica probada, login wall detect) |
| `strategies/scroll-anon-completo.ts` | G: Scroll anónimo completo | **LA estrategia para los 152 sin sesión** (Log 19): requiere Chrome real (`channel:'chrome'`) headful; cierra el login wall (selectores amplios A/B), `mouse.wheel` sobre la columna derecha de comentarios (x~1000), reinicio de scroll (la carga se dispara al LLEGAR al fondo), rebote si se estanca, clic nativo "cargar más comentarios", limpieza de timestamps SSR ("125 sem") y dedupe. Verificado: 140 únicos de 152 (el resto son respuestas + autor excluido) |
| `strategies/external-service.ts` | D: Apify externo | Actor `instax~instagram-only-0-75-get-post-info---all-comments-replies` ($0.75/1000, run-sync-get-dataset-items, tope 200, URL sin query params) → **respaldo** (sin sesión da solo ~15 únicos repetidos ×7); requiere `APIFY_TOKEN` (free tier 5 USD/mes renovable); skip automático si no está configurado |
| `strategies/scrapfly-external.ts` | F: ScrapFly externo | `GET api.scrapfly.io/scrape` con `render=true&asp=true` (session pooling de ScrapFly) → `page.setContent(html)` → reutiliza extracción DOM probada; requiere `SCRAPFLY_TOKEN` (free tier 1000 créditos/mes, ~11 créditos por request → ~90 sorteos/mes); skip automático si no está configurado |
| `parsers/instagram-paste.ts` | E: Parser manual crudo | Detecta el formato de copiado de IG (username propio / timestamp / texto / "Foto del perfil de...") y reconstruye pares; `pareceFormatoInstagram()` integrado en `parsearParticipantesManuales` (modo manual del wizard lo usa automáticamente) |

### Orquestador `instagram-v2.ts`
- Setup: sesión guardada (storageState) o cookies pegadas (addCookies) → goto → consentimiento → autor (og:url) → mediaId → `comment_count` esperado.
- Lanzamiento: **sin sesión → `chromium.launch({ headless: false, channel: 'chrome' })`** (fallback a Chromium si Chrome no está instalado) — el navegador visible es parte del mecanismo anti-detección. Con sesión/cookies → headless normal.
- Cascada dinámica: **sin sesión G→A→B→C→F→D** (G primero porque captura todo y las otras la ensucian); **con sesión A→B→C→G→F→D** (las API locales con sesión son las más rápidas). Guarda el mejor resultado; acepta cuando ≥ 50% del total esperado (`UMBRAL_MINIMO = 0.5`) o ≥ 20 sin meta; dedupe condicional por toggle `eliminarDuplicados` (`usuario|comentario`); slice a `cantidadMaxima`.
- Reexporta `validarUrlInstagram` para no romper `index.ts`.

## Limitaciones Conocidas del Scraping (2026)

- **Instagram sin sesión (CORREGIDO, Log 19):** el límite de ~15-16 comentarios NO es por falta de sesión: es por **detección de automatización** (headless, DevTools, Chromium). Con **Chrome real anónimo** (headful + `channel:'chrome'`) + scroll con rueda sobre la columna derecha, la Estrategia G captura TODOS los top-level (verificado: 140 únicos de 152; el resto son respuestas a comentarios + el autor `bazardigital.hinata` excluido). Si IG cambia el comportamiento, respaldos: botón "Conectar mi cuenta" (sesión guardada), cookies pegadas, Apify (D) o modo manual (E).
- **TikTok:** requiere que el DOM exponga `[data-e2e="comment-item"]` (sin login puede devolver pocos o 0).
- **YouTube:** funciona con scrollIntoView + lazy-load (autor + comentario).

## Logs Relacionados

- `Logs/08-Mejoras-UI-Flujo-Premium-2026-08-02_*.md`
- `Logs/09-Scraping-Real-Comentarios-Modo-Manual-2026-08-02_*.md`
- `Logs/10-Exclusion-Autor-Publicacion-del-Sorteo-2026-08-02_*.md`
- `Logs/12-Recoleccion-TODOS-los-Comentarios-Instagram-2026-08-02_*.md`
- `Logs/13-Login-Asistido-Instagram-Diagnostico-Publicacion-2026-08-02_*.md`
- `Logs/14-Propuesta-Claude-Cascada-Estrategias-Instagram-2026-08-02_*.md`
- `Logs/18-Toggle-Eliminar-Duplicados-2026-08-03_*.md`
- `Logs/19-Estrategia-G-Scroll-Anonimo-Chrome-Real-2026-08-03_*.md`
- `Logs/15-Estrategia-F-ScrapFly-FreeTier-Apify-2026-08-02_*.md`
- `Logs/16-Prioridad-Metodos-Gratuitos-Cascada-ScrapFly-2026-08-02_*.md`
- Hilo `Mensajes entre modelos/03-Mejoras-UI/`
- Propuesta original: `DOCUMENTACION/06-Mejoras-Backend-Produccion/Propuesta Claude/`
