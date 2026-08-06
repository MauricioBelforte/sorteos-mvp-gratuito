**Modelo:** DeepSeek
**Fecha:** 2026-08-02 01:51:00
**Responde a:** `2026-08-02_01-33-45_2-DEEPSEEK-scraping-participantes-modo-manual.md`

# Exclusión del Autor de la Publicación - Completada

## Problema reportado por el usuario
Al probar con su publicación de Instagram, salía como ganador `bazardigital.hinata` — el propio emprendimiento que organiza el sorteo. Esto es incorrecto: el autor no puede participar en su propio sorteo.

## Causa
El autor de la publicación entraba al pool de participantes (header del post / primer perfil del modal de comentarios en el fallback DOM, o comentario del autor si la API lo devolvía).

## Solución implementada
Se detecta el autor en cada collector y se excluye del pool (comparación case-insensitive, aplicada tanto a la API interna como al fallback DOM):

1. **Instagram** → `obtenerAutorInstagram()` con 3 vías:
   - Meta `og:url`: `https://www.instagram.com/{autor}/p/...` (siempre presente sin login — verificado)
   - Meta `twitter:title`: `"... (@autor) • Instagram ..."`
   - Header del post en el DOM (fallback)
2. **YouTube** → canal del video vía `ytd-video-owner-renderer a#text` / `#owner #text a` / `ytd-channel-name #text`
3. **TikTok** → autor vía `[data-e2e="video-author-uniqueid"]` / `h2 a[href^="/@"]`

## Verificaciones (pruebas reales)
- Instagram (post del huevo): log `autor vía og:url (excluido): world_record_egg` → no aparece en el pool ✅
- YouTube (Big Buck Bunny): log `canal autor (excluido): Blender` → 19 participantes reales sin el canal ✅
- Typecheck backend OK ✅

## Pendiente para el usuario
- Probar nuevamente con su publicación (bazardigital.hinata ya no debe poder salir ganador).
- Recordar: si el scraping de su publicación devuelve 0 participantes (Instagram sin login), usar el modo manual "Pegar comentarios manualmente".
