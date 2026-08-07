# 05-Checklist - Módulo 10: Optimización RAM Render

**Autor:** Devin-SWE 1.6  
**Fecha:** 2026-08-07  
**Versión:** 1.0

## Checklist de Implementación

### Fase 1: Preparación
- [ ] Leer y entender AGENTS.md completo
- [ ] Leer documentación existente del proyecto
- [ ] Leer mensajes entre modelos (08-Optimizacion-RAM-Render)
- [ ] Analizar código actual de scraping (instagram-v2.ts, scroll-anon-completo.ts)
- [ ] Crear estructura de carpetas plan-inicial
- [ ] Crear los 5 archivos obligatorios (01-05)
- [ ] Crear archivo 06-Plan-Testings.md
- [ ] Actualizar DOCUMENTACION/README.md con nuevo módulo

### Fase 2: Implementación de Componentes Base
- [ ] Crear `api/src/lib/virtual-scroll-manager.ts`
  - [ ] Implementar clase VirtualScrollManager
  - [ ] Implementar scrollChunk()
  - [ ] Implementar getNextChunkConfig()
  - [ ] Implementar shouldFallback()
  - [ ] Implementar getProgress()
  - [ ] Unit tests

- [ ] Crear `api/src/lib/dom-purger.ts`
  - [ ] Implementar clase DOMPurger
  - [ ] Implementar purgeProcessedNodes()
  - [ ] Implementar purgeScrollTriggers()
  - [ ] Implementar forceCleanup()
  - [ ] Implementar getPurgeStats()
  - [ ] Implementar 3 niveles de purga
  - [ ] Unit tests

- [ ] Crear `api/src/lib/gc-optimizer.ts`
  - [ ] Implementar clase GCOptimizer
  - [ ] Implementar triggerGC()
  - [ ] Implementar getHeapStats()
  - [ ] Implementar adjustGCFrequency()
  - [ ] Implementar getGCMetrics()
  - [ ] Implementar 3 niveles de GC
  - [ ] Unit tests

- [ ] Crear `api/src/lib/memory-monitor-advanced.ts`
  - [ ] Implementar clase MemoryMonitorAdvanced
  - [ ] Implementar getMemoryUsage()
  - [ ] Implementar checkThreshold()
  - [ ] Implementar shouldFallback()
  - [ ] Implementar getMemoryTrend()
  - [ ] Implementar startMonitoring()
  - [ ] Implementar stopMonitoring()
  - [ ] Unit tests

### Fase 3: Implementación de Estrategia Principal
- [ ] Crear `api/src/collectors/strategies/scroll-virtual-dom.ts`
  - [ ] Implementar estrategiaScrollVirtualDom()
  - [ ] Integrar VirtualScrollManager
  - [ ] Integrar DOMPurger
  - [ ] Integrar GCOptimizer
  - [ ] Integrar MemoryMonitorAdvanced
  - [ ] Implementar fallback mechanism
  - [ ] Implementar logging detallado
  - [ ] Unit tests
  - [ ] Integration tests

### Fase 4: Configuración y Optimización
- [ ] Crear `api/src/config/virtual-dom-config.ts`
  - [ ] Definir CHUNK_SIZES
  - [ ] Definir GC_FREQUENCY
  - [ ] Definir MEMORY_THRESHOLDS
  - [ ] Definir TIMEOUTS

- [ ] Modificar `api/src/collectors/instagram-v2.ts`
  - [ ] Importar nueva estrategia
  - [ ] Implementar lógica de selección de estrategia
  - [ ] Implementar fallback a estrategia clásica
  - [ ] Testing de integración

- [ ] Modificar `api/src/lib/memoria.ts`
  - [ ] Mejorar precisión de lectura de cgroup
  - [ ] Implementar getMemoryTrend()
  - [ ] Implementar predictOOM()
  - [ ] Optimizar rendimiento

- [ ] Modificar `api/src/collectors/strategies/types.ts`
  - [ ] Agregar VirtualScrollConfig
  - [ ] Agregar ChunkResult
  - [ ] Agregar PurgeStats
  - [ ] Extender ContextoScraping

- [ ] Modificar `Dockerfile`
  - [ ] Agregar variables de entorno SCRAPER_MODE
  - [ ] Agregar variables de memoria
  - [ ] Optimizar layers de Docker
  - [ ] Testing de build

### Fase 5: Optimización de Chrome
- [ ] Actualizar flags de Chrome en instagram-v2.ts
  - [ ] Mantener flags existentes estables
  - [ ] Agregar nuevos flags agresivos
  - [ ] Reducir max-old-space-size a 256
  - [ ] Testing de estabilidad

- [ ] Implementar resource interception
  - [ ] Bloquear imágenes
  - [ ] Bloquear videos
  - [ ] Bloquear CSS/fonts
  - [ ] Bloquear analytics
  - [ ] Testing de impacto

### Fase 6: Testing Unitario
- [ ] Escribir tests para VirtualScrollManager
  - [ ] Test scrollChunk()
  - [ ] Test getNextChunkConfig()
  - [ ] Test shouldFallback()
  - [ ] Test getProgress()

- [ ] Escribir tests para DOMPurger
  - [ ] Test purgeProcessedNodes()
  - [ ] Test purgeScrollTriggers()
  - [ ] Test forceCleanup()
  - [ ] Test getPurgeStats()

- [ ] Escribir tests para GCOptimizer
  - [ ] Test triggerGC()
  - [ ] Test getHeapStats()
  - [ ] Test adjustGCFrequency()
  - [ ] Test getGCMetrics()

- [ ] Escribir tests para MemoryMonitorAdvanced
  - [ ] Test getMemoryUsage()
  - [ ] Test checkThreshold()
  - [ ] Test shouldFallback()
  - [ ] Test getMemoryTrend()

- [ ] Escribir tests para scroll-virtual-dom
  - [ ] Test flujo completo
  - [ ] Test fallback mechanism
  - [ ] Test logging

### Fase 7: Testing de Integración
- [ ] Testing local con post pequeño (<500 comentarios)
  - [ ] Verificar que no ocurra OOM
  - [ ] Verificar precisión ≥95%
  - [ ] Verificar tiempo <2 minutos
  - [ ] Verificar logging detallado

- [ ] Testing local con post medio (500-1500 comentarios)
  - [ ] Verificar que no ocurra OOM
  - [ ] Verificar precisión ≥95%
  - [ ] Verificar tiempo <3 minutos
  - [ ] Verificar chunking correcto

- [ ] Testing local con post grande (>1500 comentarios)
  - [ ] Verificar que no ocurra OOM
  - [ ] Verificar precisión ≥95%
  - [ ] Verificar tiempo <5 minutos
  - [ ] Verificar fallback si es necesario

### Fase 8: Testing en Render
- [ ] Deploy a Render free (512 MB)
  - [ ] Verificar que contenedor arranque
  - [ ] Verificar memory usage inicial <350 MB
  - [ ] Verificar que no ocurra OOM

- [ ] Testing en Render con post pequeño
  - [ ] Verificar que no ocurra OOM
  - [ ] Verificar precisión ≥95%
  - [ ] Verificar tiempo de ejecución
  - [ ] Verificar métricas de memoria

- [ ] Testing en Render con post medio
  - [ ] Verificar que no ocurra OOM
  - [ ] Verificar precisión ≥95%
  - [ ] Verificar tiempo de ejecución
  - [ ] Verificar métricas de memoria

- [ ] Testing en Render con post grande
  - [ ] Verificar que no ocurra OOM
  - [ ] Verificar precisión ≥95%
  - [ ] Verificar tiempo de ejecución
  - [ ] Verificar fallback si es necesario

### Fase 9: Monitoreo y Métricas
- [ ] Implementar logging de memoria por chunk
  - [ ] Memory usage antes/después de chunk
  - [ ] GC duration
  - [ ] Extraction rate
  - [ ] Purge stats

- [ ] Implementar alertas de memoria
  - [ ] Warning threshold (75%)
  - [ ] Critical threshold (85%)
  - [ ] Fallback threshold (90%)

- [ ] Implementar métricas de performance
  - [ ] Time per chunk
  - [ ] Total time
  - [ ] Memory peak
  - [ ] GC frequency

### Fase 10: Documentación
- [ ] Actualizar `api/src/collectors/strategies/scroll-virtual-dom.ts` con comentarios
- [ ] Actualizar `api/src/lib/virtual-scroll-manager.ts` con comentarios
- [ ] Actualizar `api/src/lib/dom-purger.ts` con comentarios
- [ ] Actualizar `api/src/lib/gc-optimizer.ts` con comentarios
- [ ] Actualizar `api/src/lib/memory-monitor-advanced.ts` con comentarios
- [ ] Actualizar `api/src/config/virtual-dom-config.ts` con comentarios

### Fase 11: Logs y Registro
- [ ] Generar log de propuesta (06-Optimizacion-RAM-Virtual-DOM-Propuesta)
- [ ] Generar log de implementación (07-Optimizacion-RAM-Virtual-DOM-Implementacion)
- [ ] Generar log de testing (08-Optimizacion-RAM-Virtual-DOM-Testing)
- [ ] Actualizar Logs/ULTIMO_NUMERO.txt

### Fase 12: Validación Final
- [ ] Verificar que Estrategia G clásica no se rompe
- [ ] Verificar que funciona en local con sesión
- [ ] Verificar que funciona en local sin sesión
- [ ] Verificar que funciona en Render free
- [ ] Verificar métricas de éxito (memoria, precisión, tiempo)
- [ ] Verificar que no hay errores de consola
- [ ] Verificar que no hay memory leaks

### Fase 13: Comunicación
- [ ] Actualizar Mensajes entre modelos/ESTADO-PARALELO.md
- [ ] Crear mensaje en 08-Optimizacion-RAM-Render/ con resultados
- [ ] Documentar decisión final (éxito / fallback a plan pago)

## Criterios de Éxito

### Criterios Técnicos
- [ ] Boot memory <350 MB
- [ ] Peak memory <400 MB
- [ ] Precisión ≥95% comparado con Estrategia G clásica
- [ ] Tiempo <5 minutos para posts de hasta 3000 comentarios
- [ ] Sin OOM en Render free (512 MB)

### Criterios de Calidad
- [ ] Código sigue AGENTS.md
- [ ] Tests unitarios pasan
- [ ] Tests de integración pasan
- [ ] Tests E2E pasan
- [ ] Documentación completa
- [ ] Logs generados

### Criterios de Mantenibilidad
- [ ] Código legible y bien comentado
- [ ] Arquitectura modular
- [ ] Fallback mechanism robusto
- [ ] Métricas de monitoreo implementadas
- [ ] Configuración centralizada

## Fallback Plan

Si la implementación no cumple los criterios de éxito:

### Opción A: Ajustes Finos
- [ ] Ajustar chunk sizes
- [ ] Ajustar GC frequency
- [ ] Ajustar memory thresholds
- [ ] Agregar más flags de Chrome
- [ ] Re-testing

### Opción B: Propuesta Composer 2.5
- [ ] Implementar estrategia G-Lite (GraphQL-first)
- [ ] Testing y validación
- [ ] Comparación de resultados

### Opción C: Plan Pago
- [ ] Documentar que free tier no es suficiente
- [ ] Recomendar Render Standard (2 GB)
- [ ] Costo-benefit analysis
- [ ] Presentar decisión al usuario

## Notas Importantes

1. **No romper Estrategia G clásica:** La estrategia visible con sesión debe seguir funcionando
2. **Testing exhaustivo:** Probar en local antes de deploy a Render
3. **Monitoreo continuo:** Implementar logging detallado de memoria
4. **Fallback robusto:** Siempre tener fallback a estrategia probada
5. **Documentación completa:** Seguir AGENTS.md estrictamente
