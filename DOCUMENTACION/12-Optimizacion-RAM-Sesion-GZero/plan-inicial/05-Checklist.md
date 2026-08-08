# 05 — Checklist.md

- [ ] Definir hipótesis (G-Zero perdió la sesión con 6bf340f y va 4ª en la rama sesión) — VERIFICADA con evidencia en 02-Analisis
- [ ] Cambiar scroll-anon-gzero.ts: contexto propio con `storageState: SESSION_PATH` si `tieneSesion && sesionExiste()`
- [ ] Cambiar scroll-anon-gzero.ts: cerrar el contexto del orquestador al crear el propio
- [ ] Cambiar scroll-anon-gzero.ts: recargarPaginaGZero conserva la sesión (crear nuevo con storage state, no solo reload)
- [ ] Cambiar instagram-v2.ts: rama con sesión → G-Zero primero (solo SCRAPER_MODE=gzero)
- [ ] Verificación local: tsc + build sin errores
- [ ] Verificación paridad sin sesión: post 152 anónimo → ~144
- [ ] Verificación prod sesión: post 254 → >= 127 (50%) — realizar tras deploy
- [ ] Log + actualización doc 5 / tareas