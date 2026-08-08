# 01-Requerimientos.md

## Problema

- Render free (512 MB) no puede sortear posts medianos (200-750 comentarios)
  con calidad:
  - Anónimo: captura ~101-144 máx (post 254 → 101; post 152 → 144).
  - Con sesión guardada (@del): captura SINIESTRA un contexto ANÓNIMO PROPIO
    dentro de G-Zero → la sesión NO se usa en el interceptor GraphQL del G-Zero;
    y con la RAM base ~452 MB (cliente IG logueado pesa más), 42 capturados.
  - Los governor reciclajes no liberan la memoria del cgroup (físico).
- La captura por sesión de la madrugada (611/1035) SE HIZO cuando G-Zero
  REUTILIZABA la página del orquestador (que sí tenía la sesión). El commit
  6bf340f cambió a "contexto propio SIEMPRE" y TIRÓ la sesión.

## Objetivo
- Que G-Zero se ejecute PRIMERO en la cascada (como en anónimo) y SIEMPRE con
  sesión heredada cuando `ctx.tieneSesion` y `SESSION_PATH` existe.
- Liberar la RAM del contexto del orquestador una vez que G-Zero crea el suyo,
  para bajar la base de ~452 MB y ampliar el margen del governor.
- Meta: post 254 con sesión → captura completa (~254) en prod free.

## Alcance
- `api/src/collectors/instagram-v2.ts`: reorden de la cascada (G-Zero primero
  SIEMPRE, si SCRAPER_MODE=gzero).
- `api/src/collectors/strategies/scroll-anon-gzero.ts`:
  - `browser.newContext(tieneSesion ? { storageState: SESSION_PATH } : {})`.
  - Al terminar G-Zero, `browser` NO se cierra (orquestador lo hace); pero el
    contexto del orquestador (ctx.page.context()) se cierra cuando creamos el
    nuevo G-Zero si es el orquestador y NO el nuestro.
- No tocar: G clásica, DOM wiping core, umbrales del governor.

## Restricciones / no-goals
- NO se agrega RAM nueva (512 siguen).
- NO HAY guerra: habilitar sesión solo cuando `ctx.tieneSesion`.
- Prueba de paridad: sin sesión debe seguir dando ~144/152.