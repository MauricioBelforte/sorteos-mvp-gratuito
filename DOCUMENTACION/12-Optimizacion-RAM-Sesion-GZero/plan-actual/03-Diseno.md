# 03 — Diseño.md

## Arquitectura del cambio (2 archivos)

### 1. `scroll-anon-gzero.ts` — contexto propio con sesión

```
orquestador (sesión @del en ctx.page.context())
    │
    └─► browser.newContext(
          ctx.tieneSesion && sessionExiste()
            ? { storageState: SESSION_PATH }   // HEREDA la sesión
            : {}                               // anónimo (caso actual)
        )
        + bloquearRecursosPesados(contexto)
        + page.setExtraHTTPHeaders(User-Agent)
        + goto(url, domcontentloaded)
        + listener GraphQL (om response)
```

- En el reciclado (`recargarPaginaGZero`): cerrar contexto propio y volver a
  crearlo con el MISMO `storageState` (sesión conservada si estaba).
- El contexto del orquestador (ctx.page.context()) se cierra AL CREAR el propio:
  `await ctx.page.context().close().catch(...)` — libera la RAM de la página
  inicial del orquestador, que no se usa más en G-Zero.
- Si `browser.newContext` falla → fallback a la página actual (anónimo vivo).

### 2. `instagram-v2.ts` — reorden de cascada (rama con sesión)

```
ANTES (rama sesión): [GraphQL, API REST, DOM, G-Zero, ScrapFly, Apify]
DESPUÉS:            [G-Zero, GraphQL, API REST, DOM, ScrapFly, Apify]
```

- Se hace SOLO si `SCRAPER_MODE === 'gzero'` (G-Zero existe) para no cambiar la
  rama sesión cuando se usa la G clásica.
- El corte por umbral (≥50% de lo esperado) ya permite salir antes si G-Zero
  rinde: 254*0.5=127 → una G-Zero con sesión que pase 127 retorna completo.

## Riesgos

- Cerrar el contexto del orquestador en G-Zero: se hace SOLO dentro de G-Zero
  y si el contexto NO ES el de la página de trabajo (nunca se cierra la página
  que seguimos usando). Cuidado con sessionstorage: si sessionExiste() false,
  NO se usa storageState.
- Session @del: puede haber caducado en sesión de IG (4-5 días) — el orquestador
  ya llegaba con "con sesión guardada" por filesystem/env; el arranque seguirá
  verificando `sesionExiste()`.