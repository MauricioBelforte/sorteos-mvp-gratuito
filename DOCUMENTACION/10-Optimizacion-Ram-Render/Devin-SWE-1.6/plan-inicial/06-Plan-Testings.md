# 06-Plan-Testings - Módulo 10: Optimización RAM Render

**Autor:** Devin-SWE 1.6  
**Fecha:** 2026-08-07  
**Versión:** 1.0

## 1. Estrategia de Testing

### 1.1 Pirámide de Testing
```
         E2E Tests (5%)
        /              \
   Integration Tests (15%)
   /                    \
Unit Tests (80%)
```

### 1.2 Enfoque de Testing
- **Unit Tests:** Pruebas aisladas de cada componente
- **Integration Tests:** Pruebas de flujo entre componentes
- **E2E Tests:** Pruebas de extremo a extremo con Instagram real
- **Performance Tests:** Pruebas de memoria y tiempo
- **Regression Tests:** Pruebas para evitar regresiones

## 2. Unit Tests

### 2.1 VirtualScrollManager Tests

#### Test 1: Configuración por Tamaño de Post
**Objetivo:** Verificar que el manager se configura correctamente según el tamaño esperado de comentarios

**Escenarios:**
- Post pequeño (<500): chunkSize=100, gcFrequency=3
- Post medio (500-1500): chunkSize=50, gcFrequency=2
- Post grande (>1500): chunkSize=25, gcFrequency=1

**Criterio de éxito:** Configuración correcta para cada tamaño

**Implementación:**
```typescript
describe('VirtualScrollManager - Configuración', () => {
  it('debe configurar chunk size=100 para posts pequeños', () => {
    const manager = new VirtualScrollManager({ expectedComments: 300 });
    expect(manager.config.chunkSize).toBe(100);
  });
  
  it('debe configurar chunk size=50 para posts medianos', () => {
    const manager = new VirtualScrollManager({ expectedComments: 1000 });
    expect(manager.config.chunkSize).toBe(50);
  });
  
  it('debe configurar chunk size=25 para posts grandes', () => {
    const manager = new VirtualScrollManager({ expectedComments: 2000 });
    expect(manager.config.chunkSize).toBe(25);
  });
});
```

#### Test 2: Extracción de Chunk
**Objetivo:** Verificar que un chunk se extrae correctamente

**Escenarios:**
- Chunk con comentarios normales
- Chunk con comentarios vacíos
- Chunk con timeout

**Criterio de éxito:** Extracción correcta y manejo de errores

#### Test 3: Detección de Fallback
**Objetivo:** Verificar que el fallback se activa correctamente

**Escenarios:**
- Memoria sobre umbral crítico
- Máximo de chunks alcanzado
- Chrome crash

**Criterio de éxito:** Fallback se activa en condiciones correctas

### 2.2 DOMPurger Tests

#### Test 1: Purga de Nodos Procesados
**Objetivo:** Verificar que los nodos procesados se purgan correctamente

**Escenarios:**
- Purga nivel 1 (ligera)
- Purga nivel 2 (media)
- Purga nivel 3 (agresiva)

**Criterio de éxito:** Nodos purgados correctamente sin afectar nodos críticos

**Implementación:**
```typescript
describe('DOMPurger - Purga de Nodos', () => {
  it('debe purgar nodos procesados en nivel 1', async () => {
    const purger = new DOMPurger(mockPage);
    const nodes = createMockNodes(10);
    await purger.purgeProcessedNodes(nodes);
    expect(purger.getPurgeStats().nodesPurged).toBeGreaterThan(0);
  });
  
  it('no debe purgar nodos críticos', async () => {
    const purger = new DOMPurger(mockPage);
    const criticalNodes = createMockCriticalNodes(5);
    await purger.purgeProcessedNodes(criticalNodes);
    expect(purger.getPurgeStats().nodesPurged).toBe(0);
  });
});
```

#### Test 2: Liberación de Memoria
**Objetivo:** Verificar que la memoria se libera después de la purga

**Escenarios:**
- Medición de memoria antes/después de purga
- Verificación de que no hay memory leaks

**Criterio de éxito:** Memoria disminuye después de purga

### 2.3 GCOptimizer Tests

#### Test 1: Trigger de GC
**Objetivo:** Verificar que el GC se trigger correctamente

**Escenarios:**
- GC trigger exitoso
- GC trigger falla (manejo de error)

**Criterio de éxito:** GC se ejecuta o se maneja el error correctamente

**Implementación:**
```typescript
describe('GCOptimizer - Trigger GC', () => {
  it('debe trigger GC exitosamente', async () => {
    const optimizer = new GCOptimizer(mockPage);
    await optimizer.triggerGC();
    const metrics = optimizer.getGCMetrics();
    expect(metrics.successfulTriggers).toBeGreaterThan(0);
  });
  
  it('debe manejar fallos de GC', async () => {
    const optimizer = new GCOptimizer(failingMockPage);
    await optimizer.triggerGC();
    const metrics = optimizer.getGCMetrics();
    expect(metrics.failedTriggers).toBeGreaterThan(0);
  });
});
```

#### Test 2: Heap Stats
**Objetivo:** Verificar que las estadísticas del heap se obtienen correctamente

**Escenarios:**
- Heap stats disponibles
- Heap stats no disponibles (manejo de error)

**Criterio de éxito:** Stats se obtienen o se maneja el error

### 2.4 MemoryMonitorAdvanced Tests

#### Test 1: Lectura de Memoria
**Objetivo:** Verificar que la memoria se lee correctamente del cgroup

**Escenarios:**
- Lectura exitosa de cgroup v2
- Lectura falla (manejo de error)

**Criterio de éxito:** Memoria se lee o se maneja el error

#### Test 2: Umbrales Dinámicos
**Objetivo:** Verificar que los umbrales se calculan dinámicamente

**Escenarios:**
- Umbral warning (75%)
- Umbral critical (85%)
- Umbral fallback (90%)

**Criterio de éxito:** Umbrales correctos para cada nivel

## 3. Integration Tests

### 3.1 Flujo Completo de Virtual DOM

#### Test 1: Flujo Completo con Post Pequeño
**Objetivo:** Verificar el flujo completo con un post pequeño

**Setup:**
- Post con ~300 comentarios
- Configuración para chunk size=100

**Pasos:**
1. Inicializar VirtualScrollManager
2. Inicializar MemoryMonitor
3. Ejecutar ciclo de chunks
4. Verificar extracción
5. Verificar purga
6. Verificar GC
7. Verificar memoria

**Criterio de éxito:**
- Todos los chunks se procesan
- Memoria permanece <400 MB
- Precisión ≥95%
- Tiempo <2 minutos

#### Test 2: Flujo Completo con Post Grande
**Objetivo:** Verificar el flujo completo con un post grande

**Setup:**
- Post con ~2000 comentarios
- Configuración para chunk size=25

**Pasos:**
1. Inicializar VirtualScrollManager
2. Inicializar MemoryMonitor
3. Ejecutar ciclo de chunks
4. Verificar extracción
5. Verificar purga
6. Verificar GC
7. Verificar memoria

**Criterio de éxito:**
- Todos los chunks se procesan
- Memoria permanece <400 MB
- Precisión ≥95%
- Tiempo <5 minutos

### 3.2 Fallback Mechanism

#### Test 1: Fallback por Memoria Crítica
**Objetivo:** Verificar que el fallback se activa cuando memoria >90%

**Setup:**
- Simular memoria crítica (90%)
- Ejecutar flujo de virtual DOM

**Criterio de éxito:** Fallback se activa y estrategia clásica se ejecuta

#### Test 2: Fallback por Chrome Crash
**Objetivo:** Verificar que el fallback se activa cuando Chrome crashea

**Setup:**
- Simular Chrome crash
- Ejecutar flujo de virtual DOM

**Criterio de éxito:** Fallback se activa y estrategia clásica se ejecuta

## 4. E2E Tests

### 4.1 Testing con Instagram Real

#### Test 1: Post Pequeño (<500 comentarios)
**URL de prueba:** Post con ~300 comentarios

**Pasos:**
1. Crear sorteo con URL
2. Ejecutar estrategia virtual DOM
3. Verificar resultados
4. Comparar con estrategia clásica

**Criterio de éxito:**
- Precisión ≥95% vs estrategia clásica
- Memoria <400 MB
- Tiempo <2 minutos
- Sin OOM

#### Test 2: Post Medio (500-1500 comentarios)
**URL de prueba:** Post con ~1000 comentarios

**Pasos:**
1. Crear sorteo con URL
2. Ejecutar estrategia virtual DOM
3. Verificar resultados
4. Comparar con estrategia clásica

**Criterio de éxito:**
- Precisión ≥95% vs estrategia clásica
- Memoria <400 MB
- Tiempo <3 minutos
- Sin OOM

#### Test 3: Post Grande (>1500 comentarios)
**URL de prueba:** Post con ~2000 comentarios

**Pasos:**
1. Crear sorteo con URL
2. Ejecutar estrategia virtual DOM
3. Verificar resultados
4. Comparar con estrategia clásica

**Criterio de éxito:**
- Precisión ≥95% vs estrategia clásica
- Memoria <400 MB
- Tiempo <5 minutos
- Sin OOM

### 4.2 Testing en Render Free

#### Test 1: Boot Memory
**Objetivo:** Verificar que el contenedor arranca con <350 MB

**Pasos:**
1. Deploy a Render free
2. Verificar boot memory
3. Verificar que no hay OOM al arranque

**Criterio de éxito:** Boot memory <350 MB

#### Test 2: Ejecución con Post Pequeño
**Objetivo:** Verificar que funciona en Render free con post pequeño

**Pasos:**
1. Crear sorteo con URL (post pequeño)
2. Ejecutar en Render free
3. Verificar memoria durante ejecución
4. Verificar resultados

**Criterio de éxito:**
- Memoria <400 MB durante ejecución
- Precisión ≥95%
- Sin OOM

#### Test 3: Ejecución con Post Grande
**Objetivo:** Verificar que funciona en Render free con post grande

**Pasos:**
1. Crear sorteo con URL (post grande)
2. Ejecutar en Render free
3. Verificar memoria durante ejecución
4. Verificar resultados

**Criterio de éxito:**
- Memoria <400 MB durante ejecución
- Precisión ≥95%
- Sin OOM

## 5. Performance Tests

### 5.1 Memory Tests

#### Test 1: Memory por Chunk
**Objetivo:** Verificar consumo de memoria por chunk

**Métricas:**
- Memory antes de chunk
- Memory después de chunk
- Memory después de purga
- Memory después de GC

**Criterio de éxito:** Memory no crece más de 10 MB por chunk

#### Test 2: Memory Peak
**Objetivo:** Verificar pico máximo de memoria

**Métricas:**
- Memory peak durante ejecución completa
- Memory promedio
- Memory al final

**Criterio de éxito:** Memory peak <400 MB

### 5.2 Time Tests

#### Test 1: Time por Chunk
**Objetivo:** Verificar tiempo por chunk

**Métricas:**
- Time de scroll
- Time de extracción
- Time de purga
- Time de GC

**Criterio de éxito:** Time por chunk <30 segundos

#### Test 2: Time Total
**Objetivo:** Verificar tiempo total de ejecución

**Métricas:**
- Time total por post size
- Time por comentario

**Criterio de éxito:**
- Post pequeño: <2 minutos
- Post medio: <3 minutos
- Post grande: <5 minutos

### 5.3 GC Tests

#### Test 1: GC Frequency
**Objetivo:** Verificar frecuencia de GC

**Métricas:**
- Número de GC triggers
- Frecuencia por chunk
- Duración promedio de GC

**Criterio de éxito:** GC frequency según configuración

#### Test 2: GC Effectiveness
**Objetivo:** Verificar efectividad de GC

**Métricas:**
- Memory liberada por GC
- Heap size antes/después de GC

**Criterio de éxito:** GC libera ≥10 MB por trigger

## 6. Regression Tests

### 6.1 Estrategia G Clásica
**Objetivo:** Verificar que la estrategia clásica no se rompe

**Test:**
- Ejecutar estrategia clásica con sesión
- Verificar que funciona correctamente
- Verificar precisión ≥99%

**Criterio de éxito:** Estrategia clásica no afectada

### 6.2 Otras Estrategias
**Objetivo:** Verificar que otras estrategias no se rompen

**Test:**
- Ejecutar estrategia GraphQL
- Ejecutar estrategia API Rest
- Ejecutar estrategia External Service

**Criterio de éxito:** Otras estrategias no afectadas

## 7. Edge Cases

### 7.1 Empty Comments
**Objetivo:** Verificar manejo de posts sin comentarios

**Test:**
- Post con 0 comentarios
- Verificar manejo de error

**Criterio de éxito:** Error manejado correctamente

### 7.2 Very Large Posts
**Objetivo:** Verificar manejo de posts muy grandes (>5000 comentarios)

**Test:**
- Post con ~5000 comentarios
- Verificar que fallback se activa si es necesario

**Criterio de éxito:** Fallback se activa o se maneja correctamente

### 7.3 Network Issues
**Objetivo:** Verificar manejo de problemas de red

**Test:**
- Simular timeout de red
- Simular falla de carga

**Criterio de éxito:** Error manejado correctamente con retry

## 8. Security Tests

### 8.1 Anti-Detection
**Objetivo:** Verificar que Instagram no detecta el comportamiento

**Test:**
- Ejecutar scraping con virtual DOM
- Verificar que no hay bloqueo
- Verificar que no hay CAPTCHA

**Criterio de éxito:** No hay detección por Instagram

### 8.2 Memory Safety
**Objetivo:** Verificar que no hay memory leaks

**Test:**
- Ejecutar múltiples sorteos consecutivos
- Verificar que memory no crece indefinidamente

**Criterio de éxito:** Memory se libera correctamente entre sorteos

## 9. Automated Testing Pipeline

### 9.1 CI/CD Integration
```yaml
# Ejemplo de pipeline (pseudo-código)
test:
  - npm run test:unit
  - npm run test:integration
  - npm run test:e2e:local
  - npm run test:performance
  
test-render:
  - deploy to render staging
  - npm run test:e2e:render
  - npm run test:memory
```

### 9.2 Test Data
**Posts de prueba:**
- Post pequeño: URL con ~300 comentarios
- Post medio: URL con ~1000 comentarios
- Post grande: URL con ~2000 comentarios
- Post muy grande: URL con ~5000 comentarios

## 10. Success Criteria

### 10.1 Functional Criteria
- [ ] Todos los unit tests pasan
- [ ] Todos los integration tests pasan
- [ ] Todos los E2E tests pasan
- [ ] Precisión ≥95% vs estrategia clásica

### 10.2 Performance Criteria
- [ ] Boot memory <350 MB
- [ ] Peak memory <400 MB
- [ ] Time post pequeño <2 minutos
- [ ] Time post medio <3 minutos
- [ ] Time post grande <5 minutos

### 10.3 Stability Criteria
- [ ] Sin OOM en Render free
- [ ] Sin memory leaks
- [ ] Sin Chrome crashes
- [ ] Fallback mechanism funciona

### 10.4 Quality Criteria
- [ ] Código coverage ≥80%
- [ ] Sin errores de TypeScript
- [ ] Sin errores de linting
- [ ] Documentación completa

## 11. Test Execution Plan

### Fase 1: Unit Tests (Day 1-2)
- Implementar unit tests
- Ejecutar unit tests
- Corregir fallos
- Verificar coverage

### Fase 2: Integration Tests (Day 3)
- Implementar integration tests
- Ejecutar integration tests
- Corregir fallos
- Verificar integración

### Fase 3: Local E2E Tests (Day 4)
- Implementar E2E tests
- Ejecutar E2E tests local
- Corregir fallos
- Verificar funcionamiento

### Fase 4: Render Testing (Day 5)
- Deploy a Render staging
- Ejecutar E2E tests en Render
- Verificar memory usage
- Corregir fallos si hay

### Fase 5: Regression Tests (Day 6)
- Ejecutar regression tests
- Verificar estrategia clásica
- Verificar otras estrategias
- Corregir regresiones si hay

### Fase 6: Final Validation (Day 7)
- Ejecutar todos los tests
- Verificar criterios de éxito
- Documentar resultados
- Generar reporte
