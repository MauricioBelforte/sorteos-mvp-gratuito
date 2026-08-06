# Documento de Tareas - Sorteosypromos

## Checklist de Tareas

### Fase 1: Estructura del Proyecto
- [x] Crear estructura de carpetas para MVP gratuito
- [x] Crear carpeta api/ para backend
- [x] Crear carpeta web/ para frontend
- [x] Crear carpetas shared-modules/ para módulos reutilizables

### Fase 2: Backend API
- [x] Configurar Express.js
- [x] Configurar Prisma con SQLite
- [x] Implementar sistema de autenticación JWT (IMPLEMENTACIÓN FUTURA)
- [x] Implementar rutas de auth (register, login, /me) (IMPLEMENTACIÓN FUTURA)
- [x] Implementar middleware de autenticación (IMPLEMENTACIÓN FUTURA)
- [x] Implementar motor de sorteos determinístico
- [x] Implementar sistema de verificación con hash
- [x] Implementar rutas de sorteos (crear, listar, obtener) SIN AUTH
- [x] Implementar scraping de Instagram con Playwright
- [x] Implementar scraping de TikTok con Playwright
- [x] Implementar scraping de YouTube con Playwright
- [x] Implementar modelo de precios por cantidad de comentarios
- [x] Eliminar límite de 3 sorteos por mes
- [x] Hacer usuarioId nullable en schema de Prisma
- [x] Corregir errores de TypeScript en backend
- [x] Instalar dependencias del backend

### Fase 3: Frontend Web
- [x] Configurar Next.js 14
- [x] Crear página home simplificada (solo pegar URL)
- [x] Implementar detección automática de red social
- [x] Implementar visualización de precios
- [x] Implementar manejo de errores
- [x] Crear página de registro (IMPLEMENTACIÓN FUTURA)
- [x] Crear página de login (IMPLEMENTACIÓN FUTURA)
- [x] Crear dashboard de usuario (IMPLEMENTACIÓN FUTURA)
- [x] Crear página de detalle de sorteo (IMPLEMENTACIÓN FUTURA)
- [x] Implementar cliente API
- [x] Implementar manejo de autenticación en frontend (IMPLEMENTACIÓN FUTURA)
- [x] Corregir error de hidratación en layout
- [x] Instalar dependencias del frontend

### Fase 4: Módulos Reutilizables
- [x] Crear módulo SEO técnico
- [x] Implementar generación de meta tags
- [x] Implementar generación de sitemap
- [x] Implementar generación de robots.txt
- [x] Implementar structured data (JSON-LD)
- [x] Configurar módulo SEO para Latinoamérica
- [x] Compilar módulo SEO
- [x] Crear módulo Mercado Pago
- [x] Implementar cliente de Mercado Pago
- [x] Implementar funciones de pago por uso
- [x] Implementar verificación de webhooks
- [x] Configurar módulo Mercado Pago
- [x] Compilar módulo Mercado Pago

### Fase 5: Integración de Módulos
- [x] Integrar módulo SEO en frontend
- [x] Integrar módulo Mercado Pago en backend
- [x] Crear rutas de pagos (/checkout, /webhook)
- [x] Configurar variables de entorno para Mercado Pago
- [x] Instalar dependencias de módulos en MVP

### Fase 6: Documentación
- [x] Crear AGENTS.md en raíz del MVP
- [x] Crear estructura DOCUMENTACION/
- [x] Crear DOCUMENTACION/README.md
- [x] Crear 1-DOCUMENTO-DE-ESPECIFICACIONES-ACTUAL.md
- [x] Crear 2-DOCUMENTO-DISENO-ACTUAL.md
- [x] Crear 3-DOCUMENTO-TAREAS-ACTUAL.md
- [x] Crear 4-DOCUMENTO-EJECUCION-ACTUAL.md
- [ ] Crear DOCUMENTACION/Plan Inicial/
- [ ] Crear carpetas por componente
- [ ] Crear documentación de cada componente
- [ ] Crear Logs/ con sistema de numeración
- [ ] Crear Mensajes entre modelos/

### Fase 7: Testing
- [ ] Crear plan de testings para backend
- [ ] Crear plan de testings para frontend
- [ ] Crear plan de testings para módulos
- [ ] Ejecutar tests unitarios
- [ ] Ejecutar tests de integración
- [ ] Ejecutar tests de edge cases
- [ ] Documentar resultados de tests

### Fase 8: Deploy
- [ ] Configurar Supabase para producción
- [ ] Configurar Upstash para producción
- [ ] Configurar Vercel para frontend
- [ ] Configurar variables de entorno de producción
- [ ] Deploy backend en producción
- [ ] Deploy frontend en producción
- [ ] Verificar funcionamiento en producción

### Fase 9: Migración a Versión Completa (Opcional)
- [ ] Evaluar éxito de MVP
- [ ] Migrar módulo SEO a versión completa
- [ ] Migrar módulo Mercado Pago a versión completa
- [ ] Integrar módulos en versión completa
- [ ] Actualizar documentación de versión completa

### Fase 10: Mejora de Interfaz Gráfica (2026-08-02)
- [x] Fase 1: Sistema de diseño base en globals.css
- [x] Fase 2: Componentes UI base (Button, Card, Input, Loader, Alert)
- [x] Fase 3: Componentes features (SocialIcons corregido, SorteoForm, PriceDisplay, ResultCard)
- [x] Instalar y configurar Tailwind CSS v3 (requisito de los componentes UI)
- [x] Fase 4: Refactorizar home page con componentes nuevos
- [x] Fase 5: Responsive design (grid responsive, breakpoints, mobile-first)
- [x] Fase 6: Testing y validación (build OK, renderizado OK, contrato backend OK)
- [x] Fase 7: Documentación (plan-actual, checklist, log, ESTADO-PARALELO)
- [ ] Testing visual manual del usuario (móvil, tablet, desktop)
- [ ] Verificar scraping real con publicación válida (backend, pre-existente)

### Fase 11: Módulo de Mejoras UI - Flujo Premium de Sorteo (2026-08-02)
- [x] Incluir imagen del sorteo (thumbnail YouTube / og:image / placeholder)
- [x] Mostrar cantidad de comentarios detectados
- [x] Selector editable de cantidad de ganadores (1-10)
- [x] Selector editable de cantidad de suplentes (0-10)
- [x] Botón "Sortear" con la configuración elegida
- [x] Animación de ruleta que recorre los comentarios y frena en el ganador (multi-ganadores)
- [x] Calidad premium (gradientes por red, micro-interacciones, loader states)
- [x] Backend: endpoint POST /api/sorteos/analizar (comentarios + imagen + precio)
- [x] Backend: helper extraerImagenPublicacion con estrategias por red
- [x] Frontend: SorteoWizard (2 pasos), RuletaGanadores, ResultCard multi-ganadores
- [x] Crear DOCUMENTACION/05-Mejoras-UI/ (plan-inicial + plan-actual, 7 archivos cada uno)
- [x] Verificación: build backend/frontend OK, endpoint analizar OK, renderizado OK
- [ ] Prueba visual manual de la animación en navegador

### Fase 12: Scraping de Participantes Reales + Modo Manual (2026-08-02)
- [x] Quitar hover-translate de la card donde se pega la URL (`<Card hover={false}>`)
- [x] Contrato `Participante { usuario, comentario }` en toda la cadena (collectors/types.ts)
- [x] YouTube: extraer pares autor+comentario con scrollIntoView + lazy-load (19 participantes reales verificados)
- [x] TikTok: pares autor+comentario por `[data-e2e="comment-item"]`
- [x] Instagram: mediaId por regex + API interna con cookies (fetch desde Node) + fallback DOM con filtro anti-UI (limitado sin login)
- [x] Modo manual en el wizard: pegar comentarios (con @usuario o sin él → Anónimo N) + parseo en backend con desambiguación
- [x] POST /sorteos: acepta participantesManuales, 422 si 0 participantes, limita ganadores/suplentes al pool
- [x] Guardar comentario en DB (campo nuevo en Participante + prisma db push)
- [x] Ruleta muestra @usuario y el comentario del ganador al frenar
- [x] ResultCard muestra @usuario y comentario de ganadores/suplentes
- [x] Respuesta del sorteo incluye comentarios (para el detalle del ganador)
- [x] Verificación: builds OK, sorteo end-to-end con YouTube (ganadores reales + comentario del ganador), sorteo con manuales OK, SSR OK
- [x] Documentación: plan-actual 04/05/07, Logs/09, ESTADO-PARALELO, hilo 03-Mejoras-UI
- [ ] Prueba visual manual del usuario en navegador (modo manual + ruleta con comentarios)

### Fase 13: Exclusión del Autor de la Publicación del Sorteo (2026-08-02)
- [x] Instagram: obtener autor vía og:url / twitter:title / header DOM y excluirlo del pool (`world_record_egg` verificado)
- [x] YouTube: excluir el canal del video del pool (`Blender` verificado, 19 participantes)
- [x] TikTok: excluir el autor del video (`[data-e2e="video-author-uniqueid"]`)
- [x] Filtro aplicado tanto en la API interna como en el fallback DOM (case-insensitive)
- [x] Verificación: typecheck OK, autor detectado y excluido en IG y YT con pruebas reales
- [x] Documentación: plan-actual 04/05/07, Logs/10, ESTADO-PARALELO, hilo 03-Mejoras-UI
- [ ] Prueba del usuario con su publicación de Instagram (bazardigital.hinata ya no debe salir ganador)

### Fase 15: Recolección de TODOS los comentarios (2026-08-02)
- [x] Instagram: carga iterativa por DOM (`cargarMasComentariosInstagram`) — extrae los visibles primero, clic estricto en "Load more comments", detecta login wall y corta
- [x] Instagram con sesión del usuario: campo opcional de cookies en el wizard → `context.addCookies()` → API paginada hasta agotar `next_max_id` (100 × 200, antes 4 fijas)
- [x] YouTube: scroll infinito real (loop de 40 ciclos con conteo creciente)
- [x] TikTok: clic en "Ver más comentarios" + scroll (loop de 60 ciclos)
- [x] Bug crítico corregido: el filtro de basura de `extraerParesDOM` descartaba todos los comentarios (incluía botones UI "Like"/"Reply" del ancestro) → limpieza de timestamps/UI + username sin "Verified" + emojis válidos
- [x] Verificación: post del huevo devuelve 10 participantes reales (antes 0) por endpoint; autor excluido; typecheck OK; build frontend OK
- [x] Documentación: plan-actual 04/05/07, Logs/11, ESTADO-PARALELO, hilo 03-Mejoras-UI
- [ ] Prueba del usuario: pegar sus cookies de Instagram (acordeón ámbar del wizard) y ver TODOS los comentarios de su publicación

### Fase 16: Diagnóstico de la publicación real del usuario + Login Asistido de Instagram (2026-08-02)
- [x] Diagnosticar por qué la publicación real del usuario (`C347268uDMm`, bazardigital.hinata) seguía devolviendo solo 15: `diag-user` → 15 participantes + autor excluido correcto; `diag-dom` → 112 links, pares correctos → el límite es de Instagram sin sesión, no del scraper
- [x] Confirmar que el usuario no puede seleccionar/copiar los comentarios en Instagram → el modo manual no cubre su caso
- [x] Login asistido: `POST /api/sorteos/instagram/login` abre ventana Chrome visible (headless: false), espera el login hasta 5 min, guarda la sesión en `.instagram-session.json` (storageState) + `.instagram-session-info.json` (usuario)
- [x] `POST /api/sorteos/instagram/logout` y `GET /api/sorteos/instagram/estado` (panel del wizard: Conectar/Desconectar + badge @usuario)
- [x] Collector usa la sesión guardada automáticamente si no hay cookies pegadas (`newContext({ storageState })`)
- [x] `/analizar` responde `sesion: 'anonima'|'cookies'|'guardada'|'manual'` + badge en la preview según el modo
- [x] `.gitignore` protege los archivos de sesión (nunca subir credenciales)
- [x] Verificación: typecheck api/web OK, build frontend OK (7 páginas), `/analizar` → 15 + `sesion: 'anonima'`, servidores 4000/3000 reiniciados
- [x] Documentación: plan-actual 04/05/07, Logs/13, ESTADO-PARALELO, hilo 03-Mejoras-UI
- [ ] Prueba del usuario: presionar "Conectar mi cuenta" en el wizard → loguearse en la ventana que se abre → analizar su publicación y ver TODOS los comentarios (~200)

### Fase 17: Implementación de la Propuesta Claude — Cascada de Estrategias de Instagram (2026-08-02)
- [x] Diagnóstico real (4 experimentos): sin sesión Instagram NO expone más de ~19 comentarios (GraphQL batch inicial, API REST → login wall HTML, XHR → login wall, modal inexistente); `comment_count: 152` real de la publicación del usuario
- [x] Estrategia A: `strategies/graphql-intercept.ts` — intercepción de respuestas GraphQL + scroll humanizado + DOM base + login wall detect
- [x] Estrategia B: `strategies/api-rest-inbrowser.ts` — fetch dentro del navegador (TLS real), paginación `next_max_id`, aborta ante login wall/CSP
- [x] Estrategia C: `strategies/dom-scroll.ts` — reutiliza la lógica probada del modal + load more
- [x] Estrategia D: `strategies/external-service.ts` — actor Apify con polling (única vía para los 152 SIN login, requiere APIFY_TOKEN; free tier 5 USD/mes renovable, confirmado)
- [x] Estrategia F: `strategies/scrapfly-external.ts` — ScrapFly (1000 requests/mes gratis, render+asp session pooling → setContent + extracción DOM)
- [x] Estrategia E: `parsers/instagram-paste.ts` — parser de texto crudo de IG + detección automática en el modo manual
- [x] Orquestador `instagram-v2.ts`: cascada A→B→C→F→D (gratuitos primero), dedupe, umbral 50% (comment_count SSR), sesión guardada/cookies soportadas
- [x] `instagram.ts` intacto (solo `export` de funciones reutilizables); `index.ts` apunta a v2
- [x] Verificación: typecheck OK; sin sesión 15 (máximo real); regresión YouTube 600 OK; parser manual 3/3 correctos; D/F skip sin tokens (B46); `.env.example` con APIFY_TOKEN + SCRAPFLY_TOKEN
- [x] Documentación: Logs/14, Logs/15, checklist Propuesta Claude, plan-actual 05 (04/05/07), ESTADO-PARALELO
- [x] **Apify integrado y probado en vivo con token real** (Log 17): actor instax ($0.75/1000), run-sync, tope 200, `--env-file` en dev. Conclusión verificada con plata real: **sin sesión de IG, ningún actor supera ~15 únicos** (los 152 requieren sesión)
- [x] **Toggle "Eliminar duplicados"** (Log 18): flag `eliminarDuplicados` en `/api/sorteos` + `/analizar` → `ContextoScraping` → estrategias (GraphQL, API in-browser, Apify) con dedupe condicional; `deduplicarParticipantes()` post-cosecha en ambas rutas; checkbox en SorteoWizard (default ON). Verificado en vivo: OFF → 105 (repetidos ×7 conservados), ON → 15 (únicos). Typecheck api/web OK, backend reiniciado (PID 23620). **Log 25: el toggle ya NO re-scrapea** — `/analizar` pide siempre crudo (`eliminarDuplicados: false`) y el check aplica `deduplicarParticipantes()` localmente en el navegador (misma clave `usuario.toLowerCase()|comentario`); al sortear se mandan los precargados ya filtrados. Verificado: sorteo con 135 precargados en 0.2 s (antes ~72 s por re-scrapeo)
- [x] **Estrategia G "Scroll anónimo completo"** (Log 19): descubrimiento del usuario — sin DevTools, cerrando el login y scrolleando la columna derecha se ven TODOS los comentarios anónimo. Verificado: Chromium headful → 15; **Chrome real (channel:'chrome') + wheel sobre la sidebar → 140 únicos**. `scroll-anon-completo.ts` con cierre robusto del login wall, wheel real, reinicio/rebote de scroll, clic "cargar más", limpieza de timestamps SSR. Orquestador sin sesión → headful + channel chrome (fallback) + cascada G→A→B→C→F→D. E2E: `/analizar` → 139, sorteo con 139 OK, sin créditos de Apify
- [x] Decisión del usuario para los 152 completos: **resuelto con la Estrategia G (gratis, sin sesión)** — Apify y login asistido quedan como respaldo para IG cambiante o servidores sin display
- [x] **Techo final con sesión = 235/237 comentarios visibles (99.2%)** (Logs 30 y 33): comparación contra la lista visible del usuario reveló 17 faltantes → arreglados con 2 fixes en `extraerParesDOM`: (1) replies se cortaban en el header (nombre+timestamp) sin llegar al texto → ahora se elige el ancestro MÁS LARGO con ≤4 perfiles (recupera los 15 de `liliianaelizabethsarti`); (2) filtro de basura disparaba falso positivo con el username `noel**api**cone` → se quitan menciones @ antes del chequeo (recupera `@noeliapicone` ×3 y `@papichamp`). Resto: 2 menciones truncadas de IG (`@gustavo.pedro.148`, `@gustavodiaz2580`) no renderizadas completas en el DOM web → irrecuperables
- [x] **E2E confirmado por endpoint real (Log 34):** `POST /api/sorteos/analizar` con sesión guardada devolvió 234 participantes (dedupe `usuario|comentario`); 232/232 comentarios visibles del usuario capturados (único sin match = caption del autor, excluido por diseño). Techo real del sistema = 234 únicos vía HTTP
- [x] **Caso sorteo Día de la Madre (`CU7wfBaLuQK`, 2538 esperados) resuelto al techo real 2393** (Log 35): sin sesión Chrome real anónimo captura 2393 (2 corridas idénticas, `prueba4`/`prueba5`); API REST con sesión devuelve **FIJAS 15** en todas las variantes (`comments_v2`→404, `high_concentration`, `sort_relevance`, `max_relevance`, `include_system_comments` → 15 + `hasMore:false`) → no es vía para los ~145 faltantes; `teresaliliadiaz` (único ausente de la pega manual) nunca aparece en DOM ni con sesión → límite externo de IG (headload no expuesto). API REST descartada como camino
- [x] **Snapshots de capturas `api/capturas/`** (Log 35): los análisis y sorteos guardan el dataset completo + metadatos (`tipo` analizar/sorteo, `urlPublicacion`, `redSocial`, `sesion` manual/cookies/guardada/anonima, `cantidadComentarios`, `participantes`) para comparar después — objetivo: cuando el **dueño del post** sortee con su sesión, comparar ese `cantidadComentarios` contra nuestro scrape anónimo del mismo post y detectar si IG expone más con la cuenta propietaria. Ignoradas por git. Verificado: `api/capturas/analizar-CU7wfBaLuQK-2026-08-05T23-44-50.json` (2393)
- [x] **Capturas persistidas en base de datos + endpoint de revisión** (Log 35): el filesystem de Render/PaaS es efímero → las capturas convierten en modelo Prisma `Captura` (migración `20260805230000_capturas_snapshots` aplicada: tipo, url, shortcode, red, sesion, cantidad, participantesJson, guardadoEn). `guardarCaptura()` escribe en DB y respalda en disco local; se integra en `/analizar` y `/sorteos`; nuevo `GET /api/capturas` para listar (filtro shortcode/tipo). Para revisar después los datos de cualquier usuario. Verificado: análisis manual → registro en DB + respaldo local (`capturas/…00-00-04.json`), lista OK

### Fase 18: Cuota Mensual de Apify + Cola de Espera + Pase Rápido (2026-08-03, Log 23)
- [x] Modelos `CuotaApify` (mes @unique, usos) y `SolicitudCola` en `schema.prisma` + migración SQL aplicada (UTF-8, `prisma migrate diff` + `db execute` porque `migrate dev` no es interactivo en este entorno)
- [x] `lib/cuota.ts`: `CUOTA_MENSUAL` (env, default 45; 0 = sin límite local), `PRECIO_PASE_COLA` (env, default 2500 ARS), `CuotaAgotadaError`, `estadoCuota()` con cuota diaria dinámica `ceil(restantes/días)`, `cuotaDisponibleHoy()`, `registrarUsoApify()` (solo tras run exitoso del actor = gasto real)
- [x] `lib/cola.ts`: `entrarEnCola`, `estadoCola` (posición FIFO + `disponibleEn`), `procesarCola` (job cada 5 min en `index.ts`, `CuotaAgotadaError` → re-pendiente + break)
- [x] `lib/sorteos-service.ts`: lógica del sorteo extraída de la ruta (`ejecutarSorteoCompleto`, `respuestaCuotaAgotada` 402 motivo 'cuota')
- [x] Flag `paseAprobado` propagado: rutas → `ContextoScraping` → `external-service.ts` (chequeo de cuota ANTES del run, registro de uso DESPUÉS); `instagram-v2.ts` re-lanza `CuotaAgotadaError`
- [x] Endpoints: `GET /api/sorteos/cuota`, `POST /api/sorteos/cola`, `GET /api/sorteos/cola/:id`; `POST /api/sorteos` y `/analizar` con catch de cuota
- [x] Frontend `SorteoWizard`: barra de cuota, pantalla de cuota agotada (Pase Rápido vs cola), vista de cola con polling 10 s y resultado final (ganadores + hash)
- [x] `.env`/`.env.example`: `APIFY_CUOTA_MENSUAL=45`, `PRECIO_PASE_COLA=2500`
- [x] E2E verificado: cuota agotada → 402 requierePago (45 s, sin gastar créditos); cola → job → sorteo completado con 139 participantes (ganador `lau.blanco06` + hash)
- [x] Pago real del Pase Rápido con MercadoPago (Log 24): `routes/pagos.ts` con `POST /pase` (preferencia via `createPayment`), `GET /pase/:id`, `POST /webhook` y `POST /verificar`; modelo `PagoPase` (migración `20260803150000_pago_pase` aplicada); `lib/pases.ts` (validar + consumir); `paseId` en preview/sorteo con rechazo 402 `pase_invalido`; página de retorno `web/app/pago/page.tsx`; wizard con restore tras el pago (localStorage) y redirect a initPoint. E2E offline verificado (aprobar pase → sorteo → consumido; reuso → 402). **Bloqueado solo el checkout real: el `MERCADO_PAGO_ACCESS_TOKEN` en `.env` es placeholder inválido (MP responde 401/403) — pegar un token TEST- real desde developers.mercadopago.com**
- [x] **Fixes de integración MP (Log 36)**: base URL SIEMPRE `api.mercadopago.com` (el host `/sandbox` no existe); `notification_url` corregida a `API_BASE_URL/api/pagos/webhook` (antes ruta no montada); `verifyWebhookSignature` reimplementada con el manifest real de MP (`id;request-id;ts` + timingSafeEqual) y validada en `/webhook` (401 si firma inválida); `pase = pase` eliminado. Unit tests `pagos.spec.ts` 5/5. Env nuevas: `API_BASE_URL`, `MERCADO_PAGO_NOTIFICATION_URL`
- [ ] Prueba visual manual del usuario en navegador

### Fase 14: Mejoras de Backend - Puesta en Producción Online (2026-08-02)
- [x] Documentar módulo 06-Mejoras-Backend-Produccion (plan-inicial + plan-actual, 7 archivos)
- [x] Definir arquitectura objetivo (Web Vercel + API Render/Railway + Postgres Supabase/Neon)
- [x] Crear base de datos PostgreSQL gratuita (Supabase/Neon)
- [x] Migrar Prisma de SQLite a PostgreSQL (provider + migración inicial)
- [ ] Subir repo a GitHub incluyendo shared-modules
- [ ] Deploy de la API (Render/Railway) con Playwright instalado
- [ ] Deploy de la web (Vercel) con NEXT_PUBLIC_API_URL pública
- [ ] Ajustar CORS y rate limiting en la API
- [ ] Verificar sorteo end-to-end en producción (cualquier persona sin registrarse)
- [ ] Ejecutar plan de testings (módulo 06) y documentar resultados

## Tareas Pendientes Prioritarias

### Alta Prioridad
1. Completar estructura de DOCUMENTACION/ con componentes
2. Crear Logs/ con sistema de numeración
3. Crear Mensajes entre modelos/ con estado actual
4. Crear plan de testings completo

### Media Prioridad
1. Configurar Supabase para producción
2. Configurar Upstash para producción
3. Deploy en Vercel

### Baja Prioridad
1. Optimización de SEO
2. Expansión de funcionalidades
3. Migración a versión completa

## Bloqueadores Actuales

- Ninguno

## Notas
- El MVP está funcional localmente (backend en puerto 4000, frontend en puerto 3000)
- Los módulos reutilizables están compilados y listos para usar
- La estructura de documentación está parcialmente completada
- Faltan los componentes individuales en DOCUMENTACION/
