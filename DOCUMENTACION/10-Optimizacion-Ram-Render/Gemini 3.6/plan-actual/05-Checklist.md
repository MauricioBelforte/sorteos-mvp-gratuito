# Módulo 10: Optimización de RAM en Render (Plan Free 512 MB)
## Checklist de Tareas - Solución Gemini 3.6 (Estrategia G-Zero)

**Modelo:** Gemini 3.6  
**Fecha:** 2026-08-07  
**Estado:** Plan Actual - Checklist  

---

## 1. Fase de Especificación y Diseño
- [x] Análisis del diagnóstico OOM en cgroup v2 de Render (512 MB).
- [x] Comparativa de soluciones (DeepSeek vs Composer 2.5 vs Gemini 3.6).
- [x] Diseño detallado de la Estrategia G-Zero (`scroll-anon-gzero.ts`).
- [x] Creación de la carpeta `DOCUMENTACION/10-Optimizacion-Ram-Render/Gemini 3.6/plan-inicial/`.
- [x] Creación de `01-Requerimientos.md`.
- [x] Creación de `02-Analisis.md`.
- [x] Creación de `03-Diseno.md`.
- [x] Creación de `04-Codigo.md`.
- [x] Creación de `05-Checklist.md`.

---

## 2. Fase de Implementación
- [ ] Implementar helper `forzarGarbageCollection()` en `api/src/lib/memoria.ts`.
- [ ] Crear el archivo `api/src/collectors/strategies/scroll-anon-gzero.ts` con Interceptor de Red Stream y DOM Wiping Engine.
- [ ] Modificar `api/src/collectors/instagram-v2.ts` para integrar `estrategiaScrollGZero` y los flags de Chromium de ultra-bajo consumo.
- [ ] Actualizar `Dockerfile` con `NODE_OPTIONS=--max-old-space-size=160`.
- [ ] Sincronizar cambios en `DOCUMENTACION/10-Optimizacion-Ram-Render/Gemini 3.6/plan-actual/`.

---

## 3. Pruebas y Validación (Plan de Testings)
- [ ] **Prueba Local de Captura Chiquita (150 comentarios):** Validar extracción `> 140` comentarios únicos en post de prueba (`C347268uDMm`).
- [ ] **Prueba Local de Captura Grande (2500 comentarios):** Validar extracción `> 2350` comentarios en post grande (`CU7wfBaLuQK`).
- [ ] **Medición de RAM Local:** Verificar que el RSS de Node se mantenga en `< 110 MB`.
- [ ] **Prueba en Render Free (Despliegue Staging/Prod):** Monitorear logs `MEM:` en cgroup v2.
- [ ] **Verificación de Estabilidad:** Confirmar 0 eventos OOM (`Exit 137`) en Render durante ejecuciones seguidas.

---

## 4. Registro de Cambios y Cierre
- [ ] Generar reporte en `Logs/` siguiendo el formato secuencial del proyecto.
- [ ] Actualizar `DOCUMENTACION/3-DOCUMENTO-TAREAS-ACTUAL.md` y `DOCUMENTACION/README.md`.
- [ ] Mover/Actualizar hilo de coordinación en `Mensajes entre modelos/ESTADO-PARALELO.md`.
