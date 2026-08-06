**Modelo:** DeepSeek
**Fecha:** 2026-08-02 02:18:00
**Responde a:** `2026-08-02_01-51-45_3-DEEPSEEK-exclusion-autor-publicacion.md`

# Recolección de TODOS los comentarios - Completada

## Problema reportado por el usuario
Al analizar su publicación de Instagram, el sistema mostraba **16 comentarios** cuando la publicación tiene muchos más. En la web hay que presionar "+" para cargar más comentarios.

## Causa raíz (diagnóstico con Playwright)
1. **Sin sesión, Instagram solo expone los primeros ~16 comentarios** del DOM; el clic en "Load more comments" **redirige a `/accounts/login`** (destruye el DOM del post → el scraper devolvía 0).
2. **Bug crítico pre-existente en `extraerParesDOM`**: el filtro de basura usaba `includes` sobre el texto del ancestro del username, que contiene los botones de UI ("Like", "Reply", "Gusta") → **descartaba TODOS los comentarios** en páginas con botones (el post del huevo daba 0 con 16 comentarios visibles).
3. El selector del botón clickeaba el DIV gigante del login wall (texto > 60 chars) en vez del botón real.

## Solución
- **Carga iterativa DOM**: `cargarMasComentariosInstagram()` — extrae primero los visibles (crítico: el clic destruye el DOM), clic estricto en "Load more comments" (solo button/a, texto corto, aria-label/title), scroll del modal, detecta el login wall y corta.
- **Cookies de sesión (clave para "todos")**: acordeón ámbar en el wizard para pegar el header `Cookie:` de instagram.com → `context.addCookies()` en el backend → la API interna pagea hasta agotar `next_max_id` (100 × 200, antes 4 fijas). Con sesión: TODOS los comentarios, sin clics.
- **`extraerParesDOM` corregido**: limpia timestamps (13m/2h/3d/1w) y etiquetas UI sueltas o pegadas ("LikeReply"); username sin badge "Verified" (repara la exclusión del autor); emojis válidos ("🥚").
- **YouTube**: scroll infinito real (40 ciclos). **TikTok**: clics "Ver más" + scroll (60 ciclos).

## Verificación
- Post del huevo por el endpoint real: **0 → 10 participantes** (`dc_core_spam: 🥚`, `mr_____hitts: 🥚🥚`, `kaique07.eu: @alexandro_souza_costa`, ...) con autor `world_record_egg` excluido.
- Typecheck backend/frontend OK, build OK, servidores 4000/3000 OK.

## Pendiente para el usuario
1. Recargar la web (Ctrl+F5) y analizar su publicación: ahora verá los ~16 visibles sin cookies.
2. Para ver **TODOS**: en el paso 1, abrir el acordeón ámbar "¿Ves pocos comentarios? Conectá tu sesión de Instagram para recolectar TODOS", seguir los pasos (F12 → Network → recargar → clic en request de www.instagram.com → copiar el valor de `Cookie:` en Request Headers) y pegar el texto. Las cookies se usan solo para la recolección en su servidor local, no se guardan.
