# 03-Diseno - Módulo 10: Optimización RAM Render

**Autor:** Devin-SWE 1.6  
**Fecha:** 2026-08-07  
**Versión:** 1.0

## 1. Arquitectura General

### 1.1 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Layer (Express)                       │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  POST /api/sorteos/analizar                                 │ │
│  └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              Instagram Collector (instagram-v2.ts)              │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Selector de Estrategia                                     │ │
│  │  - Sesion guardada → Estrategia G Clásica                  │ │
│  │  - Sin sesión → Estrategia Virtual DOM                       │ │
│  └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│         Estrategia Virtual DOM (scroll-virtual-dom.ts)          │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  VirtualScrollManager                                       │ │
│  │  ├─ Bounded Scroll (chunks de N comentarios)               │ │
│  │  ├─ DOM Snapshot                                            │ │
│  │  └─ Coordinación de purga                                   │ │
│  └──────────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  DOMPurger                                                  │ │
│  │  ├─ Eliminación de nodos procesados                         │ │
│  │  ├─ Limpieza de atributos                                   │ │
│  │  └─ Liberación de memoria                                   │ │
│  └──────────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  GCOptimizer                                                │ │
│  │  ├─ Trigger manual de GC                                    │ │
│  │  ├─ Monitoreo de heap                                      │ │
│  │  └─ Ajuste dinámico de frecuencia                          │ │
│  └──────────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  MemoryMonitor                                              │ │
│  │  ├─ Lectura de cgroup v2                                    │ │
│  │  ├─ Umbrales dinámicos                                     │ │
│  │  └─ Alertas y fallback                                      │ │
│  └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              Playwright + Chrome (Optimizado)                  │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Navegador Chrome con flags agresivos                       │ │
│  │  ├─ Resource Interception (bloqueo de imágenes)             │ │
│  │  ├─ Viewport optimizado (720p)                               │ │
│  │  └─ Process isolation agresivo                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Instagram (Target)                           │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Modal de Comentarios                                       │ │
│  │  ├─ Scroll controlado                                       │ │
│  │  ├─ DOM contenido (limitado)                                │ │
│  │  └─ GraphQL responses (interceptadas)                       │ │
│  └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Flujo de Datos Detallado

```
1. Request POST /api/sorteos/analizar
   ↓
2. Instagram Collector verifica sesión
   ↓
3. Si sesión → Estrategia G Clásica (visible)
   Si no sesión → Estrategia Virtual DOM
   ↓
4. Virtual DOM inicia:
   - Configura chunk size según post size
   - Inicializa MemoryMonitor
   - Lanza Chrome con flags optimizados
   ↓
5. Ciclo de Scroll Virtual:
   5.1 VirtualScrollManager.scrollChunk()
       ↓
   5.2 Scroll hasta cargar N comentarios
       ↓
   5.3 DOMSnapshot.takeSnapshot()
       ↓
   5.4 Extracción de comentarios del snapshot
       ↓
   5.5 DOMPurger.purgeProcessedNodes()
       ↓
   5.6 GCOptimizer.triggerGC()
       ↓
   5.7 MemoryMonitor.checkThreshold()
       ↓
   5.8 Si memoria OK → Repetir ciclo
       Si memoria crítica → Fallback a estrategia clásica
   ↓
6. Consolidación de resultados
   ↓
7. Response al cliente
```

## 2. Diseño de Componentes

### 2.1 VirtualScrollManager

#### 2.1.1 Responsabilidades
- Controlar el scroll por chunks de tamaño limitado
- Coordinar el ciclo de snapshot → extracción → purga
- Determinar el tamaño de chunk según el post size
- Manejar timeouts y retries

#### 2.1.2 Interfaz
```typescript
interface VirtualScrollManager {
  config: {
    chunkSize: number;           // Tamaño del chunk (comentarios)
    maxChunks: number;           // Máximo de chunks antes de fallback
    gcFrequency: number;         // Frecuencia de GC (cada N chunks)
    memoryThreshold: number;     // Umbral de memoria (0-1)
  };
  
  scrollChunk(): Promise<ChunkResult>;
  getNextChunkConfig(): ChunkConfig;
  shouldFallback(): boolean;
}
```

#### 2.1.3 Algoritmo de Chunking
```typescript
function getChunkConfig(expectedComments: number): ChunkConfig {
  if (expectedComments < 500) {
    return { chunkSize: 100, gcFrequency: 3, maxChunks: 10 };
  } else if (expectedComments < 1500) {
    return { chunkSize: 50, gcFrequency: 2, maxChunks: 30 };
  } else {
    return { chunkSize: 25, gcFrequency: 1, maxChunks: 120 };
  }
}
```

### 2.2 DOMPurger

#### 2.2.1 Responsabilidades
- Eliminar nodos DOM procesados
- Limpiar atributos y event listeners
- Liberar memoria del navegador
- Mantener nodos críticos (scroll triggers)

#### 2.2.2 Interfaz
```typescript
interface DOMPurger {
  purgeProcessedNodes(processedNodes: Node[]): void;
  purgeScrollTriggers(): void;
  forceCleanup(): void;
  getPurgeStats(): PurgeStats;
}
```

#### 2.2.3 Estrategia de Purga
```typescript
function purgeStrategy() {
  // Nivel 1: Purga ligera (cada chunk)
  // - Elimina nodos de comentarios procesados
  // - Limpia atributos de datos
  
  // Nivel 2: Purga media (cada 3 chunks)
  // - Nivel 1 + elimina imágenes cacheadas
  // - Limpia event listeners
  
  // Nivel 3: Purga agresiva (umbral memoria > 85%)
  // - Nivel 2 + elimina nodos de scroll triggers
  // - Force garbage collection
}
```

### 2.3 GCOptimizer

#### 2.3.1 Responsabilidades
- Trigger manual de garbage collection
- Monitorear heap size
- Ajustar frecuencia de GC dinámicamente
- Reportar métricas de GC

#### 2.3.2 Interfaz
```typescript
interface GCOptimizer {
  triggerGC(): Promise<void>;
  getHeapStats(): HeapStats;
  adjustGCFrequency(memoryUsage: number): void;
  getGCMetrics(): GCMetrics;
}
```

#### 2.3.3 Estrategia de GC
```typescript
function gcStrategy() {
  // GC leve (cada chunk)
  // - window.gc() si está disponible
  // - Limpia caches de Chrome
  
  // GC medio (cada 2 chunks)
  // - GC leve + compacta heap
  // - Limpia internales de Chrome
  
  // GC agresivo (umbral memoria > 80%)
  // - GC medio + fuerza compactación
  // - Deshabilita features pesados temporalmente
}
```

### 2.4 MemoryMonitor

#### 2.4.1 Responsabilidades
- Leer memoria del cgroup v2
- Calcular umbrales dinámicos
- Detectar condiciones de OOM
- Trigger fallback si es necesario

#### 2.4.2 Interfaz
```typescript
interface MemoryMonitor {
  getMemoryUsage(): MemoryUsage;
  checkThreshold(): boolean;
  shouldFallback(): boolean;
  getMemoryTrend(): MemoryTrend;
}
```

#### 2.4.3 Umbrales Dinámicos
```typescript
function getDynamicThresholds(): Thresholds {
  const baseUsage = 350; // MB base
  const maxUsage = 512;  // MB máximo
  const warning = 0.75;  // 75% = 384 MB
  const critical = 0.85; // 85% = 435 MB
  const fallback = 0.90; // 90% = 461 MB
  
  return { warning, critical, fallback };
}
```

## 3. Diseño de Optimizaciones de Chrome

### 3.1 Flags de Chrome (Optimizados)

```typescript
const CHROME_FLAGS_OPTIMIZED = [
  // Flags existentes (mantener)
  '--disable-blink-features=AutomationControlled',
  '--window-size=1280,720',
  '--disable-dev-shm-usage',
  '--no-sandbox',
  '--disable-gpu',
  '--disable-extensions',
  '--disable-background-networking',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
  '--disable-ipc-flooding-protection',
  '--no-zygote',
  '--js-flags=--max-old-space-size=256', // REDUCIDO de 384
  '--expose-gc',
  
  // Nuevos flags agresivos
  '--disable-software-rasterizer',
  '--disable-features=TranslateUI,VizDisplayCompositor',
  '--disable-lcd-text',
  '--disable-accelerated-2d-canvas',
  '--disable-accelerated-video-decode',
  '--disable-accelerated-mjpeg-decode',
  '--disable-accelerated-video-encode',
  '--disable-backgrounding-occluded-windows',
  '--disable-breakpad',
  '--disable-component-extensions-with-background-pages',
  '--disable-domain-reliability',
  '--disable-features=AudioServiceOutOfProcess',
  '--disable-features=CanvasOopRasterization',
  '--disable-features=IsolateOrigins',
  '--disable-features=OutOfBlinkCors',
  '--disable-features=RealboxUrlIcon',
  '--disable-features=Translate',
  '--disable-low-res-tiling',
  '--disable-metrics',
  '--disable-metrics-reporting',
  '--disable-network-service',
  '--disable-sync',
  '--disable-features=VizDisplayCompositor',
  '--force-gpu-mem-available=0',
  '--force-color-profile=srgb',
  '--hide-scrollbars',
  '--mute-audio',
  '--no-default-browser-check',
  '--no-first-run',
  '--no-report-upload',
  '--remote-debugging-port=0',
  '--disable-logging',
  '--disable-perf-logging',
  '--disable-features=IsolateOrigins,site-per-process',
];
```

### 3.2 Resource Interception

```typescript
async function setupResourceInterception(page: Page) {
  await page.route('**/*.{png,jpg,jpeg,gif,webp,svg,mp4,webm}', route => {
    route.abort();
  });
  
  await page.route('**/*.{css,ttf,woff,woff2}', route => {
    route.abort();
  });
  
  await page.route('**/analytics/**', route => {
    route.abort();
  });
}
```

### 3.3 Process Isolation

```typescript
const browserConfig = {
  channel: 'chrome',
  headless: true,
  args: CHROME_FLAGS_OPTIMIZED,
  // Process isolation agresivo
  contextOptions: {
    javaScriptEnabled: true,
    bypassCSP: true,
    ignoreHTTPSErrors: true,
  },
};
```

## 4. Diseño de Fallback

### 4.1 Estrategia de Fallback

```typescript
function getFallbackStrategy(reason: string): EstrategiaFn {
  switch (reason) {
    case 'memory_critical':
      return estrategiaScrollAnonimo; // Estrategia G clásica
    case 'extraction_failed':
      return estrategiaGraphQL; // GraphQL fallback
    case 'chrome_crashed':
      return estrategiaServicioExterno; // Apify
    default:
      return estrategiaScrollAnonimo;
  }
}
```

### 4.2 Condiciones de Fallback

```typescript
const FALLBACK_CONDITIONS = {
  memory_usage: 0.90,      // 90% de memoria
  gc_failures: 3,          // 3 fallos de GC consecutivos
  extraction_rate: 0.5,    // <50% de extracción esperada
  chrome_crashes: 1,       // 1 crash de Chrome
  timeout: 300000,         // 5 minutos
};
```

## 5. Diseño de Testing

### 5.1 Unit Tests
- VirtualScrollManager.scrollChunk()
- DOMPurger.purgeProcessedNodes()
- GCOptimizer.triggerGC()
- MemoryMonitor.checkThreshold()

### 5.2 Integration Tests
- Flujo completo de scroll virtual
- Integración con MemoryMonitor
- Fallback a estrategia clásica

### 5.3 Performance Tests
- Memoria por chunk
- Tiempo de extracción por chunk
- GC frequency y overhead

### 5.4 E2E Tests
- Post pequeño (<500 comentarios)
- Post medio (500-1500 comentarios)
- Post grande (>1500 comentarios)

## 6. Diseño de Monitoreo

### 6.1 Métricas a Monitorear
- Memory usage por chunk
- GC frequency y duración
- Extraction rate por chunk
- Scroll performance
- Chrome process count

### 6.2 Logging

```typescript
function logChunkMetrics(chunk: number, metrics: ChunkMetrics) {
  console.log(`MEM: chunk ${chunk}`);
  console.log(`  Memory: ${metrics.memoryUsage} MB`);
  console.log(`  GC duration: ${metrics.gcDuration} ms`);
  console.log(`  Extracted: ${metrics.extractedCount}`);
  console.log(`  Purged: ${metrics.purgedCount}`);
}
```

## 7. Diseño de Configuración

### 7.1 Variables de Entorno

```bash
# Estrategia de scraping
SCRAPER_MODE=virtual-dom  # virtual-dom | classic | glite

# Configuración de memoria
MEMORY_THRESHOLD_WARNING=0.75
MEMORY_THRESHOLD_CRITICAL=0.85
MEMORY_THRESHOLD_FALLBACK=0.90

# Configuración de chunks
CHUNK_SIZE_SMALL=100
CHUNK_SIZE_MEDIUM=50
CHUNK_SIZE_LARGE=25

# Configuración de GC
GC_FREQUENCY_SMALL=3
GC_FREQUENCY_MEDIUM=2
GC_FREQUENCY_LARGE=1
```

### 7.2 Configuración Dinámica

```typescript
function getDynamicConfig(): Config {
  const memoryUsage = MemoryMonitor.getMemoryUsage();
  const postSize = getExpectedCommentCount();
  
  return {
    chunkSize: getChunkSize(postSize),
    gcFrequency: getGCFrequency(memoryUsage),
    memoryThreshold: getMemoryThreshold(memoryUsage),
  };
}
```
