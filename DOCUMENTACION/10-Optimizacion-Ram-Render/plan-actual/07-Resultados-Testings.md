# 07 - Resultados de Testings - Optimización de RAM para la Estrategia G en Render free

> **Estado: IMPLEMENTADO y probado en LOCAL (2026-08-07).** Pendiente: deploy en Render y verificación de producción (P09).

## Resumen

| Fecha | Pruebas ejecutadas | Resultado | Comentario |
|-------|--------------------|-----------|------------|
| 2026-08-07 | P01 flags de Chrome (5 variantes) | **Fallo parcial → corrección** | `--single-process` crashea Chrome real; el resto es estable. Se eliminó `--single-process` de `ARGS_NAVEGADOR` |
| 2026-08-07 | P02 endpoint post real (152) | **PASS** | 142 participantes capturados (baseline ~140); umbral 142/152 cumplido |
| 2026-08-07 | P03 log `MEM:` | **PASS** | `MEM: inicio recolección {"usadoMb":0,"limiteMb":0,"rssMb":140}` (local sin cgroup: usado/limite = 0) |
| 2026-08-07 | P04 post grande | No ejecutado en local | Post de 2538 es pesado para testear en cada iteración; se cubre en producción |

## Detalle por prueba

### P01 — Lanzamiento de Chrome con flags
- **Resultado:** Corregido (ver tabla de variantes abajo)
- **Evidencia:** script `prueba-flags.mjs` (temporal, eliminado): `launch OK`, `goto OK`, `cargado estable`
- **Variantes probadas (Chrome real headful + channel chrome):**

| Variante | Resultado |
|---|---|
| base + `--single-process --no-zygote` | **CRASH**: navegador DISCONNECTED al cargar la página |
| base + `--no-zygote` | Estable |
| base + `--js-flags=--max-old-space-size=384 --expose-gc` | Estable |
| base + `--disable-software-rasterizer --disable-features=TranslateUI,VizDisplayCompositor` | Estable |
| base + todos (sin single-process) | Estable |

### P02 — Endpoint sobre post (152)
- **Resultado:** PASS — 142 participantes
- **Evidencia:** logs de la corrida local: `Instagram V2: Scroll anónimo completo -> 142 participantes`, `cumple el umbral (142/152)`, `Captura registrada en DB: 6dc17216-edc0-470e-92fa-b1afd87fc6b1 (142 participantes)`, respaldo en disco `api/capturas/analizar-C347268uDMm-2026-08-07T18-51-47.json`.

### P03 — Log `MEM:`
- **Resultado:** PASS — el log aparece en la corrida real (`MEM: inicio recolección ... rssMb:140`). En local no hay cgroup (usado/limite = 0); en Render se leerán los valores reales.

### P04 — Post grande (2538, limitado)
- **Resultado:** Pendiente (se hará en producción con `cantidadMaxima` acotada para no alargar la prueba local)

## Incidentes encontrados

1. **`--single-process` crashea Chrome real** (P01): el navegador se desconecta al navegar (error `Target page, context or browser has been closed`). **Solución:** eliminado de `ARGS_NAVEGADOR`. Documentado en `04-Codigo.md` y en el comentario del código.

## Conclusión

- La versión optimizada **captura igual que el baseline** en local (142/152 ≈ 140) y los logs de memoria funcionan.
- Queda por validar en Render: pico de RAM < 512 MB durante el scroll completo con `MEM:` en vivo (P09) y el post grande (P04).