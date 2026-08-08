# 5-DOCUMENTO-CAPACIDADES-DE-CAPTURA.md

> **Documento general vigente.** Responde cuántos comentarios de Instagram puede
> capturar el sistema según la combinación "sesión de Instagram + crédito de
> Apify", pensado para un **usuario cualquiera que usa la web** (sin acceso a la
> infraestructura).
>
> ⚠️ **REGLA DE ACTUALIZACIÓN:** cada vez que una mejora cambie estos límites
> (nueva estrategia, ajuste de memoria, integración con Apify, cambio de plan),
> este archivo **DEBE actualizarse** en el mismo commit/entrega que el código.
> Fecha de cada medición junto a la cifra.

---

## Contexto: qué significa "sesión" y "sin sesión"

- **Sin sesión** = el scraping corre en modo **anónimo** (contexto limpio, sin
  cookies de Instagram). Es el caso de cualquier visitante de la web.
- **Con sesión** = el servidor usa la **sesión de Instagram guardada** del
  dueño (login asistido). Es UNA sola sesión compartida por todo el sistema, no
  una por usuario web.
- **Crédito de Apify** = se descuenta de la cuota mensual (`APIFY_CUOTA_MENSUAL`,
  por defecto 45 USD/mes). Cada corrida completa de un post grande consume
  crédito.
- **Entorno:** Render plan **free (512 MB de RAM)** con Chromium embebido
  (`CHROME_MODE=chromium` + `SCRAPER_MODE=gzero`).

---

## Respuestas (verificadas el 2026-08-08)

### 1) Sin iniciar sesión y sin gastar crédito de Apify

**Captura garantizada y estable: ~150-300 comentarios.**

- Post chico (152 comentarios): captura **144/152 (95%)** — probado ✅
- Posts medianos/grandes (1000-2500): el DOM del renderer crece sin control y
  **OOM (512 MB)** corta la captura. Corridas sobrevividas quedaron entre
  **190-239 comentarios** antes del límite.
- Resumen: en posts de hasta ~300 el resultado es casi total; más allá se
  degrada y puede fallar con OOM. **Costo: $0.**

### 2) Iniciando sesión y sin gastar crédito de Apify

- **Verificado: hasta ~611 comentarios** (post de 1035, captura 611/1035 =
  59%) sin OOM.
- Post: 150 comentarios: 144/152 (sesión guardada, sin OOM).
- El techo real con sesión en el plan free ronda **~600-700**; pasado eso el
  DOM acumula y el riesgo de OOM vuelve.
- Nota: con una máquina con más RAM (fuera del free) se logró **2393/2399
  (97%)** en desarrollo — la sesión es la vía "sin crédito" más fuerte.
- **Costo: 0 (además del recurso del login).**

### 3) Sin iniciar sesión pero gastando crédito de Apify

- **Esperado por diseño: hasta ~2500+ comentarios, sin límite de RAM local.**
- Apify scrapea en sus propios servidores con sesión propia; no consume la RAM
  del contenedor free. Está acotado únicamente por la **cuota mensual de
  créditos** (45 USD/mes aprox. → varias corridas grandes por mes).
- Estado: implementado como estrategia (`scrapfly-external.ts`); aún no
  probado end-to-end en prod (la comunicación con API de Apify está pendiente
  de activar las credenciales reales).
- **Costo: crédito de Apify.**

### 4) Iniciando sesión y gastando crédito de Apify

- **Esperado: ~100% (captura completa + robustez).**
- Combina la sesión guardada con el scraper externo: no hay límite de RAM y
  IG da todos los comentarios. En máquina local con sesión ya se probó el
  97% (2393/2399) ≈ lo que Apify debería dar en su totalidad.
- **Costo: créditos de Apify** (misma cuota que la opción 3; la sesión local
  no agrega costo extra pero tampoco ayuda al scraper externo que usa su
  propia sesión).

---

## Otras posibilidades (además de las 4)

### 5) Sin sesión + Chrome real headless (CHROME_MODE=headless) — Probado

- Captura ~596/2538 en posts grandes (mejor que el embebido) pero el
  arranque de Chrome real ya consume ~484 MB del free → **OOM casi
  garantizado** en el plan free. Descartado como solución para free.

### 6. Con sesión + incrementar RAM del servicio (plan pago infrastructure)

- **Verificado: 2393/2399 (97%)** en máquina con RAM (no free).
- Es la vía de mayor rendimiento garantizado (sin Apify): subir el plan de
  Render (pago, ~USD 25/mes ejemplo) y Chromium puede cortar todo el post.
- **Costo: plan pago.**

### 7. Sin sesión + estrategia clásica (G clásica, sin G-Zero)

- Probado: ~59/2538 con Chromium embebido. Muy por debajo del actual G-Zero.
  No recomendado; queda como fallback de seguridad.

---

## Cuadro resumen rápido

| # | Sesión IG | Crédito Apify | Máximo capturado | Estabilidad | Costo |
|---|-----------|---------------|------------------|-------------|-------|
| 1 | No | No | ~150-300 (posts grandes: 190-250 y OOM) | Alta en posts <300; OOM en grandes | $0 |
| 2 | Sí | No | **611/1035 (~59%)** probado; techo ~600-700 | Alta hasta ~700 | $0 |
| 3 | No | Sí | Hasta ~2500+ | Alta (no usa RAM local) | Crédito Apify |
| 4 | Sí | Sí | ~100% (>2500) | Alta | Crédito Apify |
| 5 | No | No | ~596 | No (OOM en free) | $0 |
| 6 | Sí | No | 2393/2399 (97%) con RAM real | Alta (plan pago) | USD/mes |
| 7 | No | No | ~59 | Baja | $0 |

> **Recomendación MVP:** la combinación default de la web (usuario viste sin
> sesión) sirve para sorteos ≤ ~300 comentarios sin costo. Para los sorteos de
> 600-2500 hay que optar por sesión guardada (caso 2) o Apify (casos 3-4), según
> prioridad costo vs completitud. El corte "gratis y estable" actual lo marca la
> sesión guardada: ~600-700 comentarios.

---

## Registro de verificaciones (2026-08-08)

| Fecha | Entorno | Post | Resultado | Fuente |
|-------|---------|------|-----------|--------|
| 2026-08-08 | prod free / Chromium embebido / G-Zero | C347268uDMm (150) | 144 (95%) sin OOM | capture DB |
| 2026-08-08 | prod free / sesión guardada | CRmP7039Nnq (1035) | 611 sin OOM | capture DB |
| 2026-08-08 | prod free / sesión guardada (conservador) | CRmP7039Nnq (1035) | 226 sin OOM | capture DB |
| 2026-08-07 | local / Chrome real headless | CU7wfBaLuQK (2538) | 596 (headless) | test local |
| 2026-08-07 | local / Chrome real visible + sesión | CU7wfBaLuQK (2538) | 2393/2399 ~ **97%** | test local |
| 2026-08-08 | prod free anónimo | CU7wfBaLuQK y CRcazwbsZdD (~1000) | OOM (512 MB) | events Render |

---

## Glosario de términos

Explicación de cada concepto técnico usado en este documento, en lenguaje simple.

### General

| Término | Qué es |
|---------|--------|
| **Post / publicación de IG** | Una publicación de Instagram (foto, reel o carrusel) que tiene comentarios debajo. Los usuarios sortean comentando ese post. |
| **Comentario capturado** | Un comentario leído y guardado en la base de datos del sistema para poder sortearlo después. |
| **Scraping** | El proceso automático de "leer" una página web (Instagram) como si fuera un usuario, para extraer datos (los comentarios). |
| **Render (contenedor free)** | El servidor donde corre la app en internet. El plan **free** limita el uso a **512 MB de RAM** y apaga el servicio si duerme (sin peticiones). |
| **RAM (memoria)** | Memoria temporal de trabajo del servidor. Si se agota durante una captura, el proceso se corta (OOM). |
| **OOM (Out Of Memory)** | El servidor agotó los 512 MB de RAM y el sistema operativo **mató el proceso** de captura en el medio. Es la causa de la mayoría de capturas incompletas en el free. Se detecta: el servidor se reinicia y quedan capturas parciales. |
| **Memoria del container (cgroup)** | Medida de memoria usada por el contenedor. En los tests con `memoria.ts` aparece como "usado/limite". Sirve para detectar cuándo se está acercando al OOM. |
| **Guardada DB (capture DB)** | Una captura que quedó guardada en la base de datos (postgreSQL) aunque la tarea haya quedado inconclusa. |
| **Corrida (run)** | Una ejecución completa del proceso de captura de un post (desde que arranca el scraper hasta que termina o muere). |
| **End-to-end** | Prueba que usa el sistema completo tal como si lo usara un usuario real (web → API → scraper → DB), no partes aisladas. |
| **Tiempo de vida del free (sleep)** | El plan free duerme el servidor tras ~15 min sin actividad; la primera petición después del sueño demora ~50 s (cold start). |

### Sesión y anonimato

| **Término** | Qué es |
|-------------|--------|
| **Sin sesión (anónimo)** | El scraper abre un navegador limpio, **sin cookies de Instagram**. Es lo que vive un visitante cualquiera de la web. Instagram muestra menos comentarios y pone límites (login wall). |
| **Con sesión (login asistido)** | El servidor inicia sesión en Instagram como el dueño (una sola cuenta compartida) y guarda las cookies. Instagram "confía" más y permite capturar más comentarios. |
| **Login wall** | Pantalla de Instagram que pide iniciar sesión. Aparece cuando se navega anónimo mucho tiempo, y puede bloquear la captura. |
| **Cookies / sesión guardada** | Archivos de identidad que el navegador guarda tras iniciar sesión. Si se guardan en el servidor, el scraper inicia "ya logueado". |

### Navegadores

| **Término** | Qué es |
|-------------|--------|
| **Chromium embebido** (`CHROME_MODE=chromium`) | Versión de Chrome comprimida (headless) que se instala dentro del mismo paquete de la app. Liviana y chica de arranque (~267-325 MB) pero con menos capacidad de render, el DOM crece más. Es el modo por defecto del proveedor `Render` free. |
| **Chrome real** (`CHROME_MODE=vacío` / headless / visible) | El Chrome completo instalado del sistema (con imagen visual o headless). Rinde mejor procesando el DOM y captura más comentarios (596/2538) pero **arranca consumiendo ~484 MB** → casi siempre OOM en el free de 512 MB. |
| **Headless** | Navegador corriendo **sin ventana visible** (en el fondo del servidor). Es la forma normal de correr en Render. |
| **Visible / headful** | Navegador con ventana, solo sirve en desarrollo local (tu PC) para ver qué está haciendo. En Render no hay pantalla. |
| **Xvfb** | Servidor gráfico destino usado en Render cuando corre chrome visible. Suma RAM; por eso en free solo usamos Chromium embebido o headless. |

### Estrategias de captura

| **Término** | Qué es |
|-------------|--------|
| **Scroll crawler / scroll-auto** | Estrategia: abre el post e **scrollea** (baja) la lista de comentarios, leyendo los que van apareciendo. Instagram carga de a pocos por scroll — puede colgarse si el post tiene muchos. |
| **G-Zero (`SCRAPER_MODE=gzero`)** | Estrategia más nueva del proyecto, pensada para posts grandes: **intercepta las respuestas JSON que Instagram envía** (GraphQL) **antes de renderizarlas** y va guardando los comentarios sin necesidad de renderizar cada bloque. Diseñada para reducir uso de RAM. Es la estrategia **vigente** (activa en prod). |
| **G clásica** | La estrategia "normal" anterior del proyecto, basada en scroll + instrumentación de red. Funciona pero **sin mejoras de RAM**: capturó ~59/2538 en el post grande. |
| **Poda del DOM** | Borrar de la memoria los bloques HTML ya leídos (los comentarios renderizados) para que no se acumule RAM. Es clave en G-Zero para posts grandes. |
| **GraphQL / interceptor** | El truco de G-Zero: en vez de leer el HTML paginado, "escucha" las respuestas de datos que Instagram manda al navegador y extrae los comentarios de ahí directamente. |
| **RAM Governor** | Sistema de G-Zero que vigila la memoria y la libera antes de que explote: recicla (cierra y recrea) el contexto del navegador o detiene guardando parciales. NO sirve si el proceso principal de pagado retiene la RAM (lo que pasó con Chrome embebido). |
| **Estrategia externa / Apify** | Corre la captura **fuera** del servidor: un servicio externo (Apify) scrapea el post y devuelve los comentarios listos. No gasta tu RAM — solo crédito. |
| **Cascada (fallback chain)** | El orden en que el sistema intenta estrategias cuando falla: intenta la principal (G-Zero) y si falla baja a alternativas (scroll, API, etc.). |

### Apify

| **Término** | Qué es |
|-------------|--------|
| **Apify** | Plataforma externa de scraping como servicio: corren scrapers de Instagram en sus servidores sin tocar la RAM de Render y devuelven comentarios. |
| **Crédito Apify** | Moneda de gasto de Apify. Cada corrida de scraping grande consume créditos de la cuota mensual (`APIFY_CUOTA_MENSUAL`, por defecto 45 USD/mes). |
| **Scraper / Actor de Apify** | Un script predefinido en Apify que scrapea un tipo de contenido (Instagram comments) y devuelve datos en JSON. |
| **API de Apify** | La interfaz por la cual nuestro servidor le pide al scraper de Apify que corra y recibe el resultado. |

### Infraestructura

| **Término** | Qué es |
|-------------|--------|
| **Producción (prod)** | El servidor desplegado en internet (Render) que usan los usuarios reales. Todo lo de captura está sintonizado para prod free 512 MB. |
| **Local / dev** | Tu PC corriendo la app con `npm run dev`. No tiene los límites de RAM ni el sueño de free: se pueden probar estrategias que en prod no caben. |
| **Dockerfile** | Receta con la que se arma la imagen del servidor en Render. Ahí está limitado el heap de Node (`--max-old-space-size=320`). |
| **Task / timeout de tarea** | El API limita la duración de la captura (ej. 640 s). Si la captura tarda más, la tarea termina con lo que se haya guardado hasta ese momento. |
| **OOM killer** | El mecanismo del sistema operativo que, al no quedar RAM, mata procesos para salvar el sistema. Es el que termina las capturas. |

---

## Tabla comparativa final (consulta rápida)

| Modo | Uso de RAM aprox. | Riesgo OOM en free | Sirve para |
|------|-------------------|--------------------|------------|
| Chromium embebido, anónimo | ~267-325 MB arranque, crece con el DOM | Alto en posts >300 | Sorteos chicos (≤300) |
| Chromium embebido + sesión | igual arranque, DOM crece menos | Medio (hasta ~600-700) | Sorteos medianos |
| Chrome real headless | ~484 MB solo arrancando | Muy alto (casi fijo) | No para free; sí con plan pago |
| Apify (externa) | 0 en el contenedor | No | Sorteos 600-2500+ (gasta crédito) |