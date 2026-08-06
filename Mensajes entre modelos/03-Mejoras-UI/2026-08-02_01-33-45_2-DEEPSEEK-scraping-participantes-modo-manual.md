**Modelo:** DeepSeek
**Fecha:** 2026-08-02 01:33:00
**Responde a:** `2026-08-02_00-58-45_1-DEEPSEEK-modulo-mejoras-ui-completado.md`

# Scraping de Participantes Reales + Modo Manual - Ejecución Completada

## Problema reportado por el usuario
1. La card donde se pega la URL se movía con el hover del mouse (inutilizable al pegar).
2. El sorteo anterior solo mostró 2 personas, y al verificar no participaban en el sorteo real.
3. En Instagram puede copiar los comentarios a mano, pero no quién los hizo.
4. La animación debe mostrar a la persona que comentó como ganadora y ver qué comentario hizo para ganar.
5. El sorteo debe arrojar a otras personas (pool completo).

## Diagnóstico (verificado con pruebas reales)
- Las estrategias DOM viejas capturaban menciones del caption y nombres de la UI (Follow, footer de Meta, "Edited 394w") → "2 personas que no participaban".
- Instagram sin login (2026): el DOM NO renderiza comentarios ni usernames, y la API interna responde `{"status":"fail"}` (i.instagram.com) o 302 a login (www). Verificado con diagnóstico directo.
- YouTube sí funciona: los comentarios cargan con lazy-load → hace falta `scrollIntoView` sobre `ytd-comments`.

## Solución implementada (verificada end-to-end)
1. **Card del formulario:** `<Card hover={false}>` en `web/app/page.tsx`.
2. **Nuevo contrato** `Participante { usuario, comentario }` en toda la cadena (`api/src/collectors/types.ts`).
3. **YouTube:** pares autor+comentario por `ytd-comment-thread-renderer` con lazy-load → **19 participantes reales** verificados (ej: `@ShinyFilms: I saw this playing on TV's...`).
4. **TikTok:** pares por `[data-e2e="comment-item"]`.
5. **Instagram:** mediaId por regex → API interna con cookies del navegador (fetch desde Node) → fallback DOM con filtro anti-UI. Documentado que sin login devuelve [].
6. **Modo manual (plan B garantizado):** toggle en el wizard + textarea "uno por línea"; formato `@usuario comentario` o solo el comentario (→ `Anónimo N`); parseo en `parsearParticipantesManuales()` con desambiguación de repetidos.
7. **POST /sorteos:** acepta `participantesManuales`, devuelve 422 si 0 participantes con sugerencia, limita ganadores/suplentes al pool, guarda el comentario en DB (campo nuevo + db push), e incluye `comentarios` en la respuesta.
8. **Ruleta:** muestra `@usuario` girando y al frenar muestra "Su comentario". **ResultCard:** muestra @usuario + comentario de cada ganador/suplente.

## Verificaciones
- Sorteo end-to-end YouTube: 19 participantes, ganadores `ceweoh`/`AshrafAnwer-kk8ft`, suplente `bigburd875`, hash OK, comentario del ganador adjunto ("This Big Chungus for the PS4 gameplay is so good").
- Sorteo con 10 manuales: 2 ganadores + 2 suplentes del pool completo (arroja a otras personas ✅).
- Builds backend/frontend OK, SSR de ruleta/ResultCard OK (objetos y strings sin regresión), 422 sin participantes OK.
- Documentación actualizada: plan-actual 04/05/07, 3-DOCUMENTO-TAREAS Fase 12, Logs/09, ESTADO-PARALELO.

## Pendiente para el usuario
- Prueba visual en navegador (http://localhost:3000): pegar comentarios manualmente en un sorteo de prueba y ver la ruleta con @usuario + comentario del ganador.
- Mejora futura opcional: scraper de Instagram con sesión del usuario (login persistente en Playwright) para automatizar lo que hoy cubre el modo manual.
