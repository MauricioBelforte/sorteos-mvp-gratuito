# 05 — Checklist.md

- [x] Definir hipótesis (G-Zero perdió la sesión con 6bf340f y va 4ª en la rama sesión) — VERIFICADA con evidencia en 02-Analisis
- [x] Cambiar scroll-anon-gzero.ts: reutilizar el contexto logueado del orquestador si `tieneSesion && sesionExiste()`
- [x] Cambiar scroll-anonzero.ts: cenar el contexto propio solo cuando NO hay sesión (fix de cleanup)
- [x] Cambiar scroll-anonzero.ts: reinicios con sesión usan `reload` (conserva cookies), no recrear contexto
- [x] Cambiar instagram-v2.ts: rama con sesión → G-Zero primero (solo SCRAPER_MODE=gzero)
- [x] Verificación local: tsc + build sin errores
- [x] Verificación paridad sin sesión: sin cambios en path anónimo (mismo resultado ~101/224)
- [x] Verificación sesión local: post 254 → 224/254 (88%) — cumple umbral
- [ ] Push + deploy; verificación prod post 254 → >=101, y post grande con sesión
- [ ] Log + actualización doc 5 / tareas