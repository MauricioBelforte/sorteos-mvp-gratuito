# 02-Análisis - Módulo 10: Optimización RAM Render

**Autor:** Devin-SWE 1.6  
**Fecha:** 2026-08-07  
**Versión:** 1.0

## 1. Análisis del Dominio

### 1.1 Arquitectura Actual del Scraping
El sistema actual implementa la Estrategia G con el siguiente flujo:

```
Usuario → API → Playwright → Chrome Real → Instagram
                     ↓
                Scroll Infinito
                     ↓
                DOM Creciente
                     ↓
                Extracción de Comentarios
                     ↓
                OOM (512 MB)
```

**Problema fundamental:** El DOM crece sin límite durante el scroll infinito, almacenando todos los comentarios en memoria del navegador simultáneamente.

### 1.2 Análisis de Consumo de Memoria

#### 1.2.1 Desglose de Memoria por Componente
- **Node.js + Express:** ~60 MB
- **Playwright Core:** ~80 MB
- **Chrome Base (sin página):** ~200 MB
- **DOM de Instagram (inicial):** ~80 MB
- **Scroll DOM (creciente):** ~50-150 MB (variable según cantidad de comentarios)
- **Total estimado:** 470-570 MB

#### 1.2.2 Puntos de Hotspot de Memoria
1. **Chrome renderer process:** ~60% del total
2. **DOM nodes acumulados:** ~25% del total
3. **JavaScript heap:** ~10% del total
4. **Image cache:** ~5% del total

### 1.3 Análisis de Estrategias Existentes

#### 1.3.1 Estrategia G Clásica (Actual)
- **Ventajas:** 99.2% precisión, funciona con sesión
- **Desventajas:** Muere por OOM en 512 MB
- **Memoria:** 477 MB boot + crecimiento DOM

#### 1.3.2 Propuesta DeepSeek (Chromium Headless)
- **Enfoque:** Usar Chromium embebido en lugar de Chrome real
- **Ventajas:** Ahorro estimado 50-80 MB
- **Desventajas:** Riesgo de detección por Instagram, menor precisión
- **Estado:** En prueba

#### 1.3.3 Propuesta Composer 2.5 (G-Lite)
- **Enfoque:** GraphQL-first + poda DOM + reciclado adaptativo
- **Ventajas:** Arquitectura innovadora, ahorro potencial significativo
- **Desventajas:** Complejidad alta, requiere mantenimiento de GraphQL
- **Estado:** Propuesta técnica

## 2. Análisis de Alternativas

### 2.1 Alternativa A: Virtual DOM Streaming (Propuesta Devin-SWE 1.6)

#### 2.1.1 Concepto Fundamental
Procesar el DOM en "chunks virtuales" que se descartan inmediatamente después de extraer los datos, similar a como funcionan los frameworks modernos de UI (React, Vue) pero aplicado al scraping.

#### 2.1.2 Arquitectura Propuesta
```
Usuario → API → Playwright → Chrome → Instagram
                     ↓
                Scroll con Límite
                     ↓
                Virtual DOM Chunk (1-50 comentarios)
                     ↓
                Extracción Inmediata
                     ↓
                Purga del Chunk
                     ↓
                Siguiente Chunk
```

#### 2.1.3 Técnicas Clave
1. **Bounded Scroll:** Scroll solo hasta cargar N comentarios, procesar, purgar, continuar
2. **DOM Snapshot:** Tomar snapshot del DOM, extraer datos, luego revertir
3. **Selective GC:** Trigger manual de GC después de cada chunk
4. **Image Interception:** Bloquear imágenes en el nivel de red (no solo render)
5. **Process Isolation:** Usar process isolation agresivo de Chrome

#### 2.1.4 Estimación de Ahorro
- **DOM contenido:** Mantener solo ~50 comentarios en memoria (vs todos)
- **Ahorro estimado:** 100-150 MB de memoria DOM
- **Boot target:** <350 MB
- **Peak target:** <400 MB

#### 2.1.5 Ventajas
- Precisión similar a Estrategia G (mismo DOM base)
- Arquitectura más simple que GraphQL
- Fácil de entender y mantener
- Fallback natural a Estrategia G si falla

#### 2.1.6 Desventajas
- Requiere implementación compleja de scroll controlado
- Puede ser más lento (scroll stop-and-go)
- Riesgo de perder comentarios si la purga es agresiva

### 2.2 Alternativa B: Memoria Compartida + Swap

#### 2.2.1 Concepto
Usar técnicas de memoria compartida y swap artificial para extender la memoria efectiva.

#### 2.2.2 Análisis
- **Ventajas:** No requiere cambios en la lógica de scraping
- **Desventajas:** Render no permite swap custom, complejo de implementar
- **Viabilidad:** Baja (limitaciones de plataforma)

### 2.3 Alternativa C: Fragmentación de Requests

#### 2.3.1 Concepto
Dividir el scraping en múltiples requests pequeños, cada uno procesando un chunk de comentarios.

#### 2.3.2 Análisis
- **Ventajas:** Aísla memoria por request
- **Desventajas:** Requiere estado compartido entre requests, complejo
- **Viabilidad:** Media (arquitectura significativamente diferente)

### 2.4 Alternativa D: Chromeless / API-First

#### 2.4.1 Concepto
Usar APIs de Instagram directamente sin navegador.

#### 2.4.2 Análisis
- **Ventajas:** Muy bajo consumo de memoria
- **Desventajas:** Instagram detecta y bloquea, requiere autenticación compleja
- **Viabilidad:** Baja (alto riesgo de bloqueo)

## 3. Decisión de Diseño

### 3.1 Alternativa Seleccionada
**Alternativa A: Virtual DOM Streaming** con las siguientes características:

### 3.2 Justificación

#### 3.2.1 Precisión vs Memoria
- **Precisión:** Mantiene el mismo DOM base que Estrategia G → alta precisión
- **Memoria:** Controla el crecimiento del DOM → baja memoria
- **Balance:** Óptimo entre las dos restricciones

#### 3.2.2 Complejidad vs Mantenibilidad
- **Complejidad:** Media (scroll controlado + purga DOM)
- **Mantenibilidad:** Alta (conceptos familiares de virtual scrolling)
- **Balance:** Aceptable para el beneficio

#### 3.2.3 Riesgo vs Beneficio
- **Riesgo:** Medio (implementación compleja)
- **Beneficio:** Alto (solución robusta y escalable)
- **Balance:** Positivo

### 3.3 Arquitectura Detallada

#### 3.3.1 Componentes Principales
1. **VirtualScrollManager:** Controla el scroll por chunks
2. **DOMPurger:** Elimina nodos DOM procesados
3. **MemoryMonitor:** Monitorea memoria en tiempo real
4. **GCOptimizer:** Trigger manual de GC
5. **ResourceInterceptor:** Bloquea recursos pesados

#### 3.3.2 Flujo de Datos
```
Scroll Request → VirtualScrollManager
                ↓
            Scroll Limitado (50 comentarios)
                ↓
            DOM Snapshot
                ↓
            Extracción de Datos
                ↓
            DOMPurger (limpia nodos)
                ↓
            GCOptimizer (trigger GC)
                ↓
            MemoryMonitor (verifica umbral)
                ↓
            Próximo Chunk (si memoria OK)
                ↓
            Fallback (si memoria crítica)
```

#### 3.3.3 Configuración por Tamaño de Post
- **Pequeño (<500):** Chunks de 100, GC cada 3 chunks
- **Medio (500-1500):** Chunks de 50, GC cada 2 chunks
- **Grande (>1500):** Chunks de 25, GC cada chunk

## 4. Análisis de Implementación

### 4.1 Archivos a Modificar
- `api/src/collectors/strategies/scroll-anon-completo.ts` → `scroll-virtual-dom.ts`
- `api/src/collectors/instagram-v2.ts` → agregar estrategia virtual DOM
- `api/src/lib/memoria.ts` → mejoras en monitoreo
- `Dockerfile` → ajustes de flags de Chrome

### 4.2 Archivos a Crear
- `api/src/collectors/strategies/scroll-virtual-dom.ts` (nueva estrategia)
- `api/src/lib/virtual-scroll-manager.ts` (gestor de scroll virtual)
- `api/src/lib/dom-purger.ts` (purgador de DOM)
- `api/src/lib/gc-optimizer.ts` (optimizador de GC)

### 4.3 Dependencies
- Playwright (ya existe)
- Chrome (ya existe)
- Sin nuevas dependencies externas

## 5. Análisis de Riesgos

### 5.1 Riesgo Técnico: Pérdida de Comentarios
- **Probabilidad:** Media
- **Impacto:** Alto
- **Mitigación:** Logging detallado, pruebas exhaustivas, fallback

### 5.2 Riesgo Técnico: Chrome Inestable
- **Probabilidad:** Baja
- **Impacto:** Medio
- **Mitigación:** Testing incremental, flags estables

### 5.3 Riesgo de Negocio: Solución Insuficiente
- **Probabilidad:** Media
- **Impacto:** Alto
- **Mitigación:** Métricas claras, plan B (plan pago)

## 6. Análisis de Métricas

### 6.1 Métricas de Éxito
- Boot memory: <350 MB
- Peak memory: <400 MB
- Precisión: ≥95%
- Tiempo: <5 min (3000 comentarios)

### 6.2 Métricas de Monitoreo
- Memory usage por chunk
- GC frequency
- Scroll performance
- Extraction accuracy
