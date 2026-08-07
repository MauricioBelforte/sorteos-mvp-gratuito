# Módulo 10: Optimización de RAM en Render (Plan Free 512 MB)
## Propuesta y Solución de Gemini 3.6 (Estrategia G-Zero)

**Modelo:** Gemini 3.6  
**Fecha:** 2026-08-07  
**Estado:** Plan Inicial - Especificación de Requerimientos  

---

## 1. Declaración del Problema

El servicio backend (Node.js + Express + Playwright + Prisma) está desplegado en el plan **Free de Render**, el cual impone un límite estricto de **512 MB de memoria RAM** administrado a través de **Linux cgroup v2** (`/sys/fs/cgroup/memory.max`).

Durante la ejecución de la **Estrategia G** (Scroll Anónimo Completo para recolección de comentarios de Instagram):
1. El contenedor arranca consumiendo entre **477 MB y 484 MB** (según se use Chrome headless o Chrome visible con Xvfb), dejando un margen operativo extremadamente reducido de apenas **28 MB a 35 MB**.
2. El proceso de scroll infinito en Instagram provoca una acumulación continua de nodos DOM en la memoria del proceso Renderer de Chromium y buffers en el proceso Node.js.
3. Transcurridos ~80-85 segundos de recolección, el consumo total del contenedor supera el límite de 512 MB, desencadenando la acción del **OOM Killer del kernel de Linux (`SIGKILL` / Exit code 137)**. Esto resulta en errores `502 Bad Gateway` en Render y el aborto de la extracción de comentarios.

---

## 2. Objetivos

### 2.1 Objetivos Cuantitativos
- **Reducción de RAM Base (Arranque):** Reducir el footprint inicial del contenedor de ~480 MB a **< 280 MB**, generando un margen de seguridad de **> 230 MB** en el cgroup v2.
- **Pico Máximo Durante Scroll:** Mantener el consumo total de RAM del contenedor por debajo de los **350 MB** (70% del límite de 512 MB) durante scrolls prolongados de más de 2.000 comentarios.
- **Tasa de Efectividad de Extracción:** Conservar una precisión de extracción del **99%+** (ej. ~144/152 en posts pequeños y ~2390/2400 en posts grandes).
- **Cero Errores OOM:** Eliminar completamente los eventos `server_failed (nonZeroExit:137)` en el entorno de producción en Render Free.

### 2.2 Objetivos Cualitativos
- **Evasión de Detección de Bots:** Mantener intacto el comportamiento natural del navegador (eventos de mouse, scroll con rueda, headers y cookies anónimas) para evitar que Instagram limite la carga infinita de comentarios.
- **Desacoplamiento y Compatibilidad:** Implementar la solución bajo la nueva estrategia **G-Zero (`scroll-anon-gzero.ts`)**, garantizando que el flujo clásico y visible de la Estrategia G en entornos locales no sufra ninguna regresión.
- **Observabilidad en Tiempo Real:** Integrar monitoreo activo del cgroup v2 con alertas y auto-reciclaje dinámico ante umbrales de memoria.

---

## 3. Alcance del Módulo

### 3.1 Incluido
- Creación del nuevo handler de recolección anónima **`scroll-anon-gzero.ts`**.
- Reducción del cota de Heap de Node.js a `NODE_OPTIONS=--max-old-space-size=160` en el `Dockerfile`.
- Implementación de **Intercepción Streaming de Red (Network Interception)** para capturar comentarios directamente desde las respuestas HTTP/GraphQL en vuelo.
- Implementación de **DOM Wiping (Purga en Vivo de Nodos DOM)** dentro del navegador Chromium para impedir el crecimiento del RenderTree.
- Implementación de un **Dynamic RAM Governor** que consulte cgroup v2 y fuerce el reciclaje de tab/GC cuando la RAM supere el 75% (~380 MB).
- Optimización de flags de Chromium y reducción de Viewport a `800x600`.
- Documentación y suite de pruebas en `DOCUMENTACION/10-Optimizacion-Ram-Render/Gemini 3.6/`.

### 3.2 Excluido
- Modificación de las estrategias logueadas (A, B, C) o de servicios externos (Apify, ScrapFly).
- Migración a planes de pago de Render (Render Starter o Standard).

---

## 4. Restricciones y Supuestos

1. **Entorno de Despliegue:** Render Free tier (512 MB RAM, 0.1 CPU compartida, contenedor Linux x86_64 sin permisos root ni swap).
2. **Detección de Instagram:** Los endpoints de GraphQL de Instagram requieren un flujo de scroll real con navegador para ser emitidos con tokens válidos (LSD, doc_id, headers contextuales). No se pueden invocar como peticiones HTTP aisladas sin navegador.
3. **Compatibilidad:** La solución debe ser 100% compatible con Node 20 LTS, Playwright 1.4x y Express.
