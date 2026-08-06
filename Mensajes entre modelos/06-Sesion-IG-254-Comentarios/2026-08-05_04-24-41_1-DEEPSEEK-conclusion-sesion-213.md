**Modelo:** DeepSeek
**Fecha:** 2026-08-05 04:24:41
**Responde a:** hilo de trabajo `06-Sesion-IG-254-Comentarios` (creado 2026-08-04)

## Conclusión de la investigación: techo con sesión = 213 únicos

Se probaron todas las vías para recuperar los 254 comentarios de `Cm7p75TJVub` usando
la sesión real del usuario. Resultado final:

| Vía | Resultado |
|-----|-----------|
| DOM scroll (Estrategia G) **sin sesión** | ~141 únicos (Log 28) |
| DOM scroll (Estrategia G) **con sessionid pegado** | 217 crudos -> **213 limpios** (4 basuras filtradas) |
| DOM scroll **con sesión guardada** (login asistido) | **213 únicos**, `sesion: guardada` |
| API REST `/api/v1/media/{id}/comments/` | 15 por tanda; `next_min_id` inexistente/reinutilizable; **no pagina** |
| API REST con `max_id` / `min_id` / `cursor` numérico | 0 avance (misma tanda de 15) |
| GraphQL web (`/api/graphql` con `doc_id`) | Solo expone `xdt_api__v1__feed__timeline__connection` (el feed, no comentarios) |
| Botones "Ver respuestas" en el DOM | **0 existentes** en esta vista |

### Hallazgo clave
- Con sesión se pasó de ~141 a **213** únicos: la sesión SÍ libera más comentarios
  que anónimo, pero no los 254 que reporta el contador/embed.
- Los 41 restantes corresponden a comentarios internos ("headload comments",
  `has_more_headload_comments: true`) que Instagram **no expone ni por el DOM de la
  vista pública ni por su API REST paginada** (máx. 15) ni por GraphQL (solo feed).
- La API REST moderna responde `next_min_id` con un cursor serializado
  (`{"cached_comments_cursor":"...","bifilter_token":"..."}`), pero pasarlo como
  `max_id`/`min_id`/`cursor` no avanza; y `count=50/100` igual recorta a 15.

### Cambios de código en esta ronda
- `api/src/routes/instagram.ts` (login asistido): se corrigió para esperar la cookie
  `sessionid` real (polling cada 2 s, tope 5 min + 5 s de asentamiento) antes de
  guardar el storageState; el usuario re-logueó y la sesión quedó **válida**
  (10 cookies raíz: csrftoken, datr, ig_did, mid, wd, dpr, ds_user_id, sessionid,
  test_cookie, rur). La detección de usuario devuelve `@del` (falso positivo
  cosmético; la sesión es válida igual, el análisis da 213 con `sesion: guardada`).
- `api/src/collectors/strategies/scroll-anon-completo.ts` (Estrategia G): se agregó
  el filtro de basura `esBasura()` (NAVBAR_USUARIOS, UI_COMENTARIO_RE,
  LIKES_POST_RE) que eliminó las 4 entradas de navbar (ReelsReels, SearchSearch,
  Profile, "d by and 28 others") -> 213 limpios. Se removió el intento de expandir
  respuestas anidadas porque el DOM no tiene botones "Ver respuestas" (0 en la vista).
- `api/src/collectors/strategies/api-rest-inbrowser.ts`: se agregó `X-CSRFToken`
  (desde document.cookie) en los fetch, sin lograr paginación (el endpoint no entrega
  cursor reutilizable).

### Estado
- **Techo real con sesión: 213 únicos** (supera los ~141 anónimos en +72).
- El contador 254 incluye respuestas internas que IG no expone públicamente.
- Se pueden eliminar los `diag-*.tmp.ts` y `diag-*-output.txt` (ya limpiados).
- La carpeta `api/.instagram-session.json` + `.instagram-session-info.json` quedan
  como sesión válida local (gitignore protege).