# 06 - Plan de Testings - Optimización de RAM para la Estrategia G en Render free

> **Nota:** ejecutar SIEMPRE **primero en local** (Windows) antes de desplegar (requisito del usuario). La versión G optimizada debe capturar al menos lo que captura el baseline actual sin pasarse de 512 MB.

## Datos de referencia (verificados para la Estrategia G)

- Post corto (prueba): `comment_count` = 152 → techo ~140 top-level con Chrome real local.
- Post grande (fondo, no para probar completo): `comment_count` = 2538 → 2393/2399 (99.7%) con Chrome real.

## Pruebas

| ID | Test | Escenario | Pasos | Criterio de éxito |
|----|------|-----------|-------|-------------------|
| P01 | Unitaria | Lanzamiento de Chrome real con los nuevos flags | `chromium.launch({ channel: 'chrome', headless: false, args: ARGS_NAVEGADOR_nuevo })` | Chrome abre, pagina carga sin crash |
| P02 | Integración | `POST /api/sorteos/analizar` sobre post corto (152) | Endpoint local con la versión optimizada | Respuesta 200 con muchos comentarios; sin `Failed to fetch`; captura >= baseline (~140 había) |
| P03 | Observabilidad | Log `MEM:` | Revisar logs de P02 | Se ve `MEM: {usadoMb, limiteMb, rssMb}` al inicio/fin y cada ~10 iter; sin NaN |
| P04 | Carga | Post grande con `cantidadMaxima` acotada | Post de 2538 con límite 2000 | Captura >= 140; no se cuelga; termina en tiempo razonable |
| P05 | Reciclado | Cambio de página no afecta el avance | Correr P02 o P04; revisar tick del reciclado | No decrece `vistos.size`; al reciclar se mantiene el total capturado |
| P06 | Fallback | Sin Chrome disponible | Correr sin canal `chrome` | Cae a Chromium sin romper; captura > 0 |
| P07 | Sin X server | `DISPLAY` omitido | Correr en headless | No crash; captura > 0 |
| P08 | Regresión | Con sesión | Correr P02 con sesión del usuario | Flujo A/B/C intacto; G entra como anónimo y no rompe |
| P09 | Memoria en producción | Deploy y observación del log `MEM:` | Tras desplegar, correr endpoint real | Pico < 512 MB con margen; sin reinicio de la instancia |

## Método de medición de memoria

- **Local:** `process.memoryUsage().rss` (+ `global.gc()` si se compila con `--expose-gc`).
- **Producción:** cgroup v2 `/sys/fs/cgroup/memory.current` vs `memory.max` (helper previsto) + RSS de Node.
- Formato de log: `MEM: {"usadoMb":X,"limiteMb":Y,"rssMb":Z}`

## Resultados

- Se registran en `07-Resultados-Testings.md` (plan-actual) y en `05-Checklist.md`.
- Cualquier fallo bloquea el deploy hasta corrección y re-test.