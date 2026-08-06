# 05 - Checklist - Módulo de Mejoras UI (plan-actual)

## Requerimientos del Usuario (OBLIGATORIOS) - ✅ TODOS COMPLETADOS

- [x] **Incluir una imagen del sorteo** (imagen de la publicación en el preview: YouTube thumbnail / og:image con placeholder de la red)
- [x] **Mostrar cantidad de comentarios** detectados (badge "Cantidad de comentarios: N")
- [x] **Poder elegir y cambiar la cantidad de ganadores** (selector "Cantidad de Ganadores", 1-10)
- [x] **Poder elegir y cambiar la cantidad de suplentes** (selector "¿Cuántos suplentes?", 0-10)
- [x] **Botón de sortear** que ejecuta el sorteo con la configuración elegida
- [x] **Animación que pasa por todos los comentarios** hasta que frena en el ganador (RuletaGanadores, efecto slot machine con desaceleración, multi-ganadores)
- [x] **Calidad premium**: gradientes por red social, animaciones suaves, micro-interacciones, loader states

## Pedido del Usuario (Scraping de Participantes Reales) - ✅ COMPLETADO

- [x] **La animación debe mostrar la persona que comentó como ganadora** (`@usuario` en la ruleta, con su comentario al frenar)
- [x] **Ver qué comentario hizo el ganador** (bloque "Su comentario" en la ruleta y en ResultCard)
- [x] **El sorteo debe arrojar a otras personas** (pool completo de participantes, no solo 2)
- [x] **Rescatar a las personas que comentan, no solo los comentarios** (contrato `{ usuario, comentario }` en toda la cadena)
- [x] **Quitar el hover-translate de la card donde se pega la URL** (`hover={false}` en page.tsx)
- [x] **Modo manual** (plan B real): pegar los comentarios copiados a mano (con `@usuario` o sin él → `Anónimo N`) cuando el scraping automático no encuentra participantes
- [x] **El autor de la publicación no puede ganar su propio sorteo** (el emprendimiento que organiza queda excluido del pool: `bazardigital.hinata` ya no puede salir ganador)
  - [x] Instagram: `obtenerAutorInstagram()` vía og:url / twitter:title / header DOM (verificado: `world_record_egg` excluido)
  - [x] YouTube: canal excluido vía `ytd-video-owner-renderer` (verificado: `Blender` excluido, 19 participantes)
  - [x] TikTok: autor excluido vía `[data-e2e="video-author-uniqueid"]`

## Pedido del Usuario (Recolectar TODOS los comentarios) - ✅ COMPLETADO

- [x] **El scraper se quedaba en 16 comentarios** aunque la publicación tenía muchos más: Instagram sin sesión solo muestra los primeros comentarios y el botón "+" ("Load more comments") lleva al login
- [x] **Carga iterativa por DOM**: `cargarMasComentariosInstagram()` hace clic repetido en "Load more comments"/"Ver más comentarios"/"+" hasta agotar o alcanzar el límite
  - [x] Extrae primero los comentarios visibles (el clic sin sesión redirige al login y destruye el DOM → se capturan antes)
  - [x] Detecta el login wall ("Log in"/"Iniciar sesión"/"log in to view") y corta temprano sin perder lo ya extraído
  - [x] Selector estricto (solo button/a, texto corto, aria-label/title "load more comments") para no clickear divs gigantes del login wall
- [x] **Carga completa con sesión del usuario (cookies)**: campo opcional en el wizard para pegar las cookies de `instagram.com`
  - [x] Backend: `recolectarInstagram(url, cantidadMaxima, cookieStr)` inyecta cookies en el contexto (`context.addCookies`)
  - [x] API interna con paginación completa: loop hasta agotar `next_max_id` (antes solo 4 iteraciones × 200) — con sesión trae TODOS
  - [x] Con sesión, el botón "+" del DOM también carga (ya no redirige al login)
  - [x] Frontend: acordeón ámbar "Conectá tu sesión de Instagram" con instrucciones (F12 → Network → copiar Cookie) en SorteoWizard
- [x] **YouTube: scroll infinito real** (loop de 40 ciclos con conteo creciente, antes 5 scrolls fijos)
- [x] **TikTok: clic en "Ver más comentarios" + scroll** (loop de 60 ciclos con conteo creciente)
- [x] **Bug de filtro de basura corregido**: `extraerParesDOM` descartaba TODOS los comentarios porque la lista `basura` usaba `includes` sobre el texto del ancestro (que contiene botones "Like"/"Reply" de UI)
  - [x] Ahora limpia timestamps (13m/2h/3d/1w) y etiquetas de UI (sueltas o pegadas: "LikeReply") del texto antes de validar
  - [x] Username sin badge "Verified" pegado (rompía la exclusión del autor)
  - [x] Comentarios emoji válidos (longitud mínima 2, no 3 — "🥚" es participación válida)
- [x] Verificado con el post del huevo: 10 participantes reales con comentarios limpios y autor excluido (antes 0)

## Pedido del Usuario (Diagnóstico de su publicación real + Login Asistido) - ✅ COMPLETADO (pendiente prueba del usuario)

- [x] **La publicación real del usuario seguía mostrando ~15 comentarios** (`https://www.instagram.com/p/C347268uDMm/?img_index=1`, marca bazardigital.hinata) aunque él ve muchos más logueado
- [x] **Diagnóstico completo**: `diag-user.tmp.ts` → 15 participantes, autor excluido correctamente; `diag-dom.tmp.ts` → 112 links, 19 con texto, pares correctos (karen_etcheverry, mirmili2021, cataldovanesa, pia_mugetti×10)
- [x] **Conclusión verificada**: los 15 pares extraídos son CORRECTOS; el límite lo impone Instagram sin sesión, no el scraper. Sin login no hay forma de obtener los ~200
- [x] **El usuario no puede seleccionar/copiar los comentarios** en Instagram → el modo manual no cubre su caso → se implementó el login asistido
- [x] **Login asistido (1 clic)**: botón "Conectar mi cuenta" en el wizard → abre ventana de Chrome visible → el usuario se loguea una vez → el servidor guarda la sesión (storageState) y la reutiliza en todos los análisis
  - [x] Backend: `POST/GET /api/sorteos/instagram/login|logout|estado` (router nuevo `api/src/routes/instagram.ts`), espera login hasta 5 min, guarda `.instagram-session.json` + `.instagram-session-info.json`
  - [x] Collector: `newContext({ storageState })` automático si no hay cookies pegadas
  - [x] `/analizar` responde `sesion: 'anonima'|'cookies'|'guardada'|'manual'` + badge en la preview según el modo
  - [x] Frontend: panel de conexión (Conectar/Desconectar + @usuario), colapsable de cookies manuales como opción avanzada
  - [x] `.gitignore` protege los archivos de sesión (nunca subir credenciales)
- [x] Verificado: typecheck api/web OK, build frontend OK (7 páginas), `/analizar` → 15 + `sesion: 'anonima'`, servidores 4000/3000 reiniciados

## Pedido del Usuario (Implementar la Propuesta Claude — cascada de estrategias) - ✅ COMPLETADO (pendiente APIFY_TOKEN)

- [x] **Diagnóstico real de la propuesta** (4 experimentos con la publicación del usuario): sin sesión Instagram NO expone más de ~19 comentarios — GraphQL solo batch inicial (`first:12`), API REST in-browser "Failed to fetch" (CSP), XHR → HTML login wall, modal inexistente; `comment_count: 152` real
- [x] **Estrategia A (GraphQL interception)**: listener `page.on('response')` + paths múltiples + scroll humanizado + clic "Load more" estricto + login wall detect (`graphql-intercept.ts`)
- [x] **Estrategia B (API REST in-browser)**: fetch dentro del navegador con `credentials: include` (TLS real), paginación `next_max_id`, aborta ante CSP/login wall (`api-rest-inbrowser.ts`)
- [x] **Estrategia C (DOM scroll mejorado)**: reutiliza la lógica probada del modal + load more (`dom-scroll.ts`)
- [x] **Estrategia D (Apify)**: actor `apify/instagram-comment-scraper` con polling — única vía para los 152 SIN iniciar sesión; `APIFY_TOKEN` documentado en `.env.example` (`external-service.ts`)
- [x] **Estrategia F (ScrapFly)**: free tier 1000 requests/mes, `render+asp` (session pooling) → `setContent` + extracción DOM probada; `SCRAPFLY_TOKEN` en `.env.example` (`scrapfly-external.ts`)
- [x] **Estrategia E (parser manual crudo)**: detecta formato de copiado de IG y reconstruye pares; integrado automáticamente en el modo manual (`parsers/instagram-paste.ts`)
- [x] **Orquestador `instagram-v2.ts`**: cascada A→B→C→F→D (gratuitos primero: ScrapFly $0 antes que Apify $5/mes), dedupe, umbral 50% del `comment_count` SSR, soporta sesión guardada/cookies
- [x] **`instagram.ts` intacto** (solo `export` de funciones); `index.ts` apunta a v2; regresión YouTube OK (600)
- [x] Verificado: typecheck OK, sin sesión 15 (máximo real de IG), parser manual 3/3 pares correctos, skip automático de D/F sin tokens (sin regresión)
- [x] **Apify configurado y probado en vivo** (Log 17): `APIFY_TOKEN` en `api/.env`, script `dev` con `--env-file`, actor `instax~instagram-only-0-75-get-post-info---all-comments-replies` ($0.75/1000, run-sync-get-dataset-items, tope 200). **Verificado: sin sesión de IG ningún actor supera ~15 únicos** (los 105 items eran los mismos 15 repetidos ×7)
- [x] **Toggle "Eliminar duplicados"** (Log 18): flag `eliminarDuplicados` en POST `/api/sorteos` y `/analizar`, propagado a la cascada (`ContextoScraping.eliminarDuplicados`) y a las estrategias (GraphQL, API in-browser, Apify). Checkbox en el wizard (default ON). Verificado en vivo: OFF → 105 (repetidos conservados), ON → 15 (únicos). Typecheck api/web OK, backend reiniciado (PID 23620)
- [x] **Estrategia G "Scroll anónimo completo"** (Log 19): descubrimiento del usuario — sin DevTools, cerrando el login y scrolleando la columna derecha de comentarios se ven TODOS anónimo. Verificado: Chromium headful → 15; **Chrome real (channel:'chrome') + mouse.wheel sobre la sidebar → 140 únicos** (152 - respuestas - autor). `strategies/scroll-anon-completo.ts` (cierre robusto de login wall, wheel real, reinicio de scroll, rebote, clic "cargar más", limpieza de timestamps "125 sem"). Orquestador sin sesión → headful + channel chrome (fallback Chromium) y cascada G→A→B→C→F→D (G primero: A/B/C la ensucian y marcan la IP). E2E verificado: `/analizar` → 139, sorteo con 139 participantes OK, sin gastar créditos de Apify
- [x] Decisión del usuario para los 152 completos: **resuelto con la Estrategia G (Chrome real anónimo, gratis)** — Apify y login asistido quedan como respaldo si IG cambia el comportamiento o en servidores sin display

## Testeo exhaustivo de métodos de scroll (04/08, Log 28) - ✅ COMPLETADO (documentado)

- [x] **Hipótesis del usuario**: "el scroll rápido corta la carga de comentarios; con scroll lento/pausado se ven todos en incógnito" — **NO se confirmó**
- [x] **11 métodos comparados** en sesiones frescas de Chrome real (publicación `Cm7p75TJVub`, 254 comentarios según embed oficial):
  - [x] Rueda rápida (Estrategia G): 139-141 únicos
  - [x] Rueda lenta pausada (900px, 3-4.5 s): 125 (peor)
  - [x] Esperas largas (10-13 s entre pasos): 141
  - [x] Rueda + clic "Cargar más comentarios": 139
  - [x] Scroll natural con rebotes: 99
  - [x] Scroll del contenedor interno (`scrollTop` JS): 57
  - [x] Expansión de "Ver todas las respuestas": 141
  - [x] Modal de comentarios / lightbox: 18 / 141 (el modal no se abre anónimo en esta vista)
  - [x] Vista móvil (viewport 390x844 + UA iPhone): 1 (login wall)
- [x] **Verificación del bug de dedupe** en `extraerParesDOM` (Set por comentario solo): impacto mínimo en esta publicación (229 pares crudos → 139 por comentario vs 141 por usuario|comentario, solo 2 perdidos de ruido "186 sem") — no explica la brecha
- [x] **Conclusión**: sin sesión ~141 es el techo físico de Instagram (misma cota que la publicación de 152 → 140). El 254 incluye respuestas anidadas solo visibles logueado. Sin cambios de código; los 254 requieren sessionid / "Conectar mi cuenta" (estrategia GraphQL, Logs 16-19)

## Diseño Agregado por el Equipo

### Backend
- [x] Crear helper `extraerImagenPublicacion()` con estrategias por red social (api/src/lib/preview.ts)
- [x] Crear endpoint `POST /api/sorteos/analizar` (api/src/routes/preview.ts, router nuevo)
- [x] Montar router en index.ts
- [x] Validaciones (URL soportada, red social válida, datos incompletos, participantes manuales sin URL)
- [x] Corregir `ignoreDeprecations` inválido en api/tsconfig.json (bloqueaba typecheck)
- [x] Interfaz `Participante { usuario, comentario }` (api/src/collectors/types.ts)
- [x] `recolectarComentarios(): Promise<Participante[]>` (youtube.ts y tiktok.ts con pares autor+texto)
- [x] Instagram: mediaId por regex + API interna con cookies del navegador (fetch desde Node) + fallback DOM con filtro anti-UI
- [x] YouTube: scrollIntoView sobre ytd-comments + filtro hilo fijado (19 participantes reales verificados)
- [x] `parsearParticipantesManuales()` con desambiguación de usuarios repetidos
- [x] POST /sorteos: modo manual, 422 si 0 participantes, límite de ganadores/suplentes al pool, guarda comentario en DB (schema + db push)
- [x] Respuesta de sorteo incluye `comentarios` (para mostrar el comentario del ganador)

### Frontend
- [x] Crear `web/lib/sorteos.ts` con helpers compartidos + interfaz `Participante`
- [x] Crear `SorteoWizard.tsx` con flujo en 2 pasos (analizar → configurar → sortear)
- [x] Modo manual en el wizard (toggle + textarea + ayuda de formato)
- [x] Crear `RuletaGanadores.tsx`: animación de frenado, `@usuario`, comentario del ganador, reduced-motion, multi-ganadores
- [x] Soporte multi-ganadores y suplentes con comentarios en `ResultCard.tsx`
- [x] Actualizar `page.tsx` (wizard + `hover={false}`)
- [x] Loading states y prevención de doble click
- [x] Manejo de errores (red no soportada, servidor caído, 0 participantes → sugiere modo manual)

### Calidad
- [x] Responsive design (grid sm/lg en configuración, imagen responsive)
- [x] Accesibilidad (labels en selects, reduced-motion, alt en imagen)
- [x] Sin errores de consola ni de tipos (build frontend y backend OK)
- [x] Build exitoso backend y frontend
- [x] Testing (plan + ejecución + resultados actualizados)

### Documentación
- [x] Crear módulo DOCUMENTACION/05-Mejoras-UI/ (plan-inicial + plan-actual)
- [x] Actualizar DOCUMENTACION/README.md
- [x] Actualizar 3-DOCUMENTO-TAREAS-ACTUAL.md
- [x] Log en Logs/ (08 y 09) y actualizar ULTIMO_NUMERO.txt
- [x] Actualizar ESTADO-PARALELO.md
- [x] Crear hilo Mensajes entre modelos/03-Mejoras-UI/

## Estado General
**Completado:** 100% (requerimientos del usuario) / 100% (módulo completo)  
**Pendiente:** prueba del usuario del **login asistido** ("Conectar mi cuenta" en el wizard → loguearse en la ventana que se abre → analizar su publicación y ver TODOS los comentarios ~200); alternativa: pegar cookies (acordeón ámbar); prueba visual manual de la animación en navegador
