# 04 — Código.md

## Archivos involucrados

| Archivo | Cambio |
|---------|--------|
| `api/src/collectors/strategies/scroll-anon-gzero.ts` | Contexto propio CON sesión si existe + cerrar contexto del orquestador + reciclado que conserva el storage state |
| `api/src/collectors/instagram-v2.ts` | Rama con sesión: G-Zero primero (si SCRAPER_MODE=gzero) |

## Funciones clave

- `estrategiaScrollAnonimoGZero(ctx)` (scroll-anon-gzero.ts): entrada; arma el
  contexto propio de scraping.
- `recargarPaginaGZero(motivo)` (idem): el governor/recargar llama a
  recargar PÁGINA (viejo) o recrea el contexto (reciclado).
- `sesionExiste()` (routes/instagram.ts, /lib): check `fs.existsSync` de
  `SESSION_PATH` + `INFO_PATH`.
- Orquestador (instagram-v2.ts): arma `estrategias[]` y corta al cumplir
  `cantidadEsperada * UMBRAL_MINIMO`.

## Pending / A confirmar con medición

- Medición post 254 sesión: esperado >= 127 (50%) thisen prod free.
- Medición post 152 anónimo: debe seguir ~144 (paridad sin sesión).