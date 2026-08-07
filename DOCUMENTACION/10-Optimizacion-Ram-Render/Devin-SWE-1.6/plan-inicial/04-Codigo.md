# 04-Codigo - Módulo 10: Optimización RAM Render

**Autor:** Devin-SWE 1.6  
**Fecha:** 2026-08-07  
**Versión:** 1.0

## 1. Archivos a Crear

### 1.1 Archivos Nuevos Principales

#### 1.1.1 `api/src/collectors/strategies/scroll-virtual-dom.ts`
**Propósito:** Implementación de la estrategia de scrolling con DOM virtual

**Funciones clave:**
```typescript
export async function estrategiaScrollVirtualDom(
  contexto: ContextoScraping
): Promise<Participante[]> {
  // Implementación principal de virtual DOM scrolling
  // Coordinación de VirtualScrollManager, DOMPurger, GCOptimizer
}
```

**Lógica principal:**
1. Inicializar VirtualScrollManager con config según post size
2. Inicializar MemoryMonitor
3. Lanzar Chrome con flags optimizados
4. Configurar resource interception
5. Ciclo de scroll virtual hasta completar o fallback
6. Consolidar resultados
7. Cleanup de recursos

#### 1.1.2 `api/src/lib/virtual-scroll-manager.ts`
**Propósito:** Gestor de scrolling por chunks virtuales

**Funciones clave:**
```typescript
export class VirtualScrollManager {
  constructor(config: VirtualScrollConfig);
  
  async scrollChunk(): Promise<ChunkResult>;
  getNextChunkConfig(): ChunkConfig;
  shouldFallback(): boolean;
  getProgress(): ScrollProgress;
}
```

**Algoritmo:**
- Scroll limitado según chunk size
- Detecta cuando se cargan N comentarios
- Toma snapshot del DOM
- Coordina con DOMPurger
- Maneja timeouts y retries

#### 1.1.3 `api/src/lib/dom-purger.ts`
**Propósito:** Purgador de nodos DOM procesados

**Funciones clave:**
```typescript
export class DOMPurger {
  purgeProcessedNodes(processedNodes: Node[]): void;
  purgeScrollTriggers(): void;
  forceCleanup(): void;
  getPurgeStats(): PurgeStats;
}
```

**Estrategia:**
- Nivel 1: Purga ligera (cada chunk)
- Nivel 2: Purga media (cada 3 chunks)
- Nivel 3: Purga agresiva (umbral memoria > 85%)

#### 1.1.4 `api/src/lib/gc-optimizer.ts`
**Propósito:** Optimizador de garbage collection

**Funciones clave:**
```typescript
export class GCOptimizer {
  triggerGC(): Promise<void>;
  getHeapStats(): HeapStats;
  adjustGCFrequency(memoryUsage: number): void;
  getGCMetrics(): GCMetrics;
}
```

**Estrategia:**
- GC leve (cada chunk)
- GC medio (cada 2 chunks)
- GC agresivo (umbral memoria > 80%)

#### 1.1.5 `api/src/lib/memory-monitor-advanced.ts`
**Propósito:** Monitor avanzado de memoria

**Funciones clave:**
```typescript
export class MemoryMonitorAdvanced {
  getMemoryUsage(): MemoryUsage;
  checkThreshold(): boolean;
  shouldFallback(): boolean;
  getMemoryTrend(): MemoryTrend;
  startMonitoring(): void;
  stopMonitoring(): void;
}
```

**Mejoras sobre memoria.ts existente:**
- Tendencia de memoria (no solo snapshot)
- Umbrales dinámicos
- Alertas proactivas
- Historial de métricas

### 1.2 Archivos de Configuración

#### 1.2.1 `api/src/config/virtual-dom-config.ts`
**Propósito:** Configuración centralizada de virtual DOM

**Contenido:**
```typescript
export const VIRTUAL_DOM_CONFIG = {
  CHUNK_SIZES: {
    SMALL: 100,
    MEDIUM: 50,
    LARGE: 25,
  },
  GC_FREQUENCY: {
    SMALL: 3,
    MEDIUM: 2,
    LARGE: 1,
  },
  MEMORY_THRESHOLDS: {
    WARNING: 0.75,
    CRITICAL: 0.85,
    FALLBACK: 0.90,
  },
  TIMEOUTS: {
    CHUNK: 30000,
    GC: 5000,
    TOTAL: 300000,
  },
};
```

## 2. Archivos a Modificar

### 2.1 `api/src/collectors/instagram-v2.ts`

**Modificaciones:**
1. Importar nueva estrategia `scroll-virtual-dom`
2. Agregar lógica de selección de estrategia:
```typescript
// Líneas ~100-120 (actual)
const headless = !!cookieStr || process.env.CHROME_MODE === 'headless';

// Nueva lógica
const scraperMode = process.env.SCRAPER_MODE || 'classic';
if (scraperMode === 'virtual-dom' && !cookieStr) {
  return estrategiaScrollVirtualDom(contexto);
}
```

**Fallback mechanism:**
```typescript
try {
  return await estrategiaScrollVirtualDom(contexto);
} catch (error) {
  console.log('Virtual DOM failed, falling back to classic');
  return await estrategiaScrollAnonimo(contexto);
}
```

### 2.2 `api/src/lib/memoria.ts`

**Modificaciones:**
1. Mejorar precisión de lectura de cgroup
2. Agregar tendencia de memoria
3. Optimizar rendimiento de lecturas

**Nuevas funciones:**
```typescript
export function getMemoryTrend(samples: number = 10): MemoryTrend {
  // Calcular tendencia basado en muestras históricas
}

export function predictOOM(currentUsage: number, trend: number): boolean {
  // Predecir si se aproximará a OOM
}
```

### 2.3 `Dockerfile`

**Modificaciones:**
1. Ajustar variables de entorno
2. Configurar cgroup limits
3. Optimizar layers de Docker

**Nuevas variables:**
```dockerfile
ENV SCRAPER_MODE=virtual-dom
ENV MEMORY_THRESHOLD_WARNING=0.75
ENV MEMORY_THRESHOLD_CRITICAL=0.85
ENV MEMORY_THRESHOLD_FALLBACK=0.90
```

### 2.4 `api/src/collectors/strategies/types.ts`

**Modificaciones:**
1. Agregar nuevos tipos para virtual DOM
2. Extender ContextoScraping

**Nuevos tipos:**
```typescript
export interface VirtualScrollConfig {
  chunkSize: number;
  maxChunks: number;
  gcFrequency: number;
  memoryThreshold: number;
}

export interface ChunkResult {
  extracted: Participante[];
  purged: number;
  memoryAfter: number;
  gcDuration: number;
}

export interface PurgeStats {
  nodesPurged: number;
  memoryFreed: number;
  purgeLevel: number;
}
```

## 3. Archivos de Testing

### 3.1 `api/src/collectors/strategies/scroll-virtual-dom.spec.ts`

**Tests unitarios:**
```typescript
describe('estrategiaScrollVirtualDom', () => {
  it('should initialize with correct config for small posts');
  it('should initialize with correct config for medium posts');
  it('should initialize with correct config for large posts');
  it('should handle memory threshold correctly');
  it('should fallback to classic strategy on OOM');
});
```

### 3.2 `api/src/lib/virtual-scroll-manager.spec.ts`

**Tests unitarios:**
```typescript
describe('VirtualScrollManager', () => {
  it('should scroll one chunk correctly');
  it('should extract comments from chunk');
  it('should handle chunk timeout');
  it('should calculate progress correctly');
});
```

### 3.3 `api/src/lib/dom-purger.spec.ts`

**Tests unitarios:**
```typescript
describe('DOMPurger', () => {
  it('should purge processed nodes');
  it('should not purge critical nodes');
  it('should free memory correctly');
  it('should handle different purge levels');
});
```

### 3.4 `api/src/lib/gc-optimizer.spec.ts`

**Tests unitarios:**
```typescript
describe('GCOptimizer', () => {
  it('should trigger GC successfully');
  it('should get heap stats');
  it('should adjust GC frequency based on memory');
  it('should handle GC failures gracefully');
});
```

## 4. Logs Relacionados

### 4.1 Logs Existentes
- `Logs/05-Mejora-Scraping-Instagram-Resolucion-Exitosa-2026-08-01_22-30-00.md`
- `Logs/04-Resolucion-Problemas-Entorno-Testing-Dinamico-2026-08-01_22-10-00.md`

### 4.2 Logs a Crear
- `Logs/06-Optimizacion-RAM-Virtual-DOM-Propuesta-2026-08-07_17-38-00.md`
- `Logs/07-Optimizacion-RAM-Virtual-DOM-Implementacion-2026-08-07_XX-XX-XX.md`
- `Logs/08-Optimizacion-RAM-Virtual-DOM-Testing-2026-08-07_XX-XX-XX.md`

## 5. Dependencias

### 5.1 Dependencias Existentes (Mantener)
- `playwright` - Browser automation
- `@prisma/client` - Database ORM
- `express` - Web framework
- `typescript` - Type system

### 5.2 Nuevas Dependencias
- **Ninguna** - Solo código TypeScript nativo

## 6. Estructura de Archivos Final

```
api/src/
├── collectors/
│   ├── instagram-v2.ts (modificado)
│   └── strategies/
│       ├── scroll-virtual-dom.ts (NUEVO)
│       ├── scroll-anon-completo.ts (existente)
│       └── types.ts (modificado)
├── lib/
│   ├── virtual-scroll-manager.ts (NUEVO)
│   ├── dom-purger.ts (NUEVO)
│   ├── gc-optimizer.ts (NUEVO)
│   ├── memory-monitor-advanced.ts (NUEVO)
│   ├── memoria.ts (modificado)
│   └── config/
│       └── virtual-dom-config.ts (NUEVO)
└── tests/
    ├── strategies/
    │   └── scroll-virtual-dom.spec.ts (NUEVO)
    └── lib/
        ├── virtual-scroll-manager.spec.ts (NUEVO)
        ├── dom-purger.spec.ts (NUEVO)
        └── gc-optimizer.spec.ts (NUEVO)
```

## 7. Código de Ejemplo Key

### 7.1 Implementación de VirtualScrollManager (Skeleton)

```typescript
export class VirtualScrollManager {
  private config: VirtualScrollConfig;
  private currentChunk: number = 0;
  private extracted: Participante[] = [];
  
  constructor(config: VirtualScrollConfig) {
    this.config = config;
  }
  
  async scrollChunk(): Promise<ChunkResult> {
    const startTime = Date.now();
    
    // Scroll hasta cargar chunkSize comentarios
    await this.scrollToChunk();
    
    // Tomar snapshot del DOM
    const snapshot = await this.takeDOMSnapshot();
    
    // Extraer comentarios
    const extracted = await this.extractComments(snapshot);
    
    // Acumular resultados
    this.extracted.push(...extracted);
    
    // Retornar métricas
    return {
      extracted,
      purged: 0, // Será calculado por DOMPurger
      memoryAfter: await this.getMemoryUsage(),
      gcDuration: 0, // Será calculado por GCOptimizer
    };
  }
  
  shouldFallback(): boolean {
    return (
      this.currentChunk >= this.config.maxChunks ||
      await this.isMemoryCritical()
    );
  }
  
  getProgress(): ScrollProgress {
    return {
      currentChunk: this.currentChunk,
      totalExtracted: this.extracted.length,
      memoryUsage: await this.getMemoryUsage(),
    };
  }
}
```

### 7.2 Implementación de DOMPurger (Skeleton)

```typescript
export class DOMPurger {
  private page: Page;
  private purgeStats: PurgeStats = {
    nodesPurged: 0,
    memoryFreed: 0,
    purgeLevel: 0,
  };
  
  constructor(page: Page) {
    this.page = page;
  }
  
  async purgeProcessedNodes(processedNodes: Node[]): Promise<void> {
    const level = this.determinePurgeLevel();
    
    for (const node of processedNodes) {
      if (this.isSafeToPurge(node, level)) {
        await this.purgeNode(node);
        this.purgeStats.nodesPurged++;
      }
    }
    
    this.purgeStats.purgeLevel = level;
  }
  
  private determinePurgeLevel(): number {
    const memoryUsage = await this.getMemoryUsage();
    if (memoryUsage > 0.85) return 3; // Agresivo
    if (memoryUsage > 0.75) return 2; // Medio
    return 1; // Ligero
  }
  
  private isSafeToPurge(node: Node, level: number): boolean {
    // No purgar nodos críticos (scroll triggers, etc.)
    return !this.isCriticalNode(node) && level >= 1;
  }
  
  private async purgeNode(node: Node): Promise<void> {
    // Eliminar nodo del DOM
    // Limpiar event listeners
    // Liberar referencias
  }
}
```

### 7.3 Implementación de GCOptimizer (Skeleton)

```typescript
export class GCOptimizer {
  private page: Page;
  private gcMetrics: GCMetrics = {
    totalTriggers: 0,
    totalDuration: 0,
    successfulTriggers: 0,
    failedTriggers: 0,
  };
  
  constructor(page: Page) {
    this.page = page;
  }
  
  async triggerGC(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Trigger GC del navegador
      await this.page.evaluate(() => {
        if (typeof window.gc === 'function') {
          window.gc();
        }
      });
      
      // Trigger GC de Chrome
      await this.triggerChromeGC();
      
      const duration = Date.now() - startTime;
      this.gcMetrics.totalTriggers++;
      this.gcMetrics.successfulTriggers++;
      this.gcMetrics.totalDuration += duration;
      
    } catch (error) {
      this.gcMetrics.failedTriggers++;
      console.error('GC trigger failed:', error);
    }
  }
  
  private async triggerChromeGC(): Promise<void> {
    // Comandos Chrome DevTools Protocol para GC
    // CDPSession -> Performance.collectGarbage
  }
  
  getHeapStats(): HeapStats {
    return this.page.evaluate(() => {
      if (typeof performance !== 'undefined' && performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        };
      }
      return null;
    });
  }
}
```

## 8. Integración con Código Existente

### 8.1 Punto de Integración Principal
**Archivo:** `api/src/collectors/instagram-v2.ts`
**Líneas:** ~100-120 (selección de estrategia)

**Código actual:**
```typescript
const headless = !!cookieStr || process.env.CHROME_MODE === 'headless';
```

**Código nuevo:**
```typescript
const scraperMode = process.env.SCRAPER_MODE || 'classic';
const headless = !!cookieStr || process.env.CHROME_MODE === 'headless';

// Nueva lógica de selección
if (scraperMode === 'virtual-dom' && !cookieStr) {
  try {
    return await estrategiaScrollVirtualDom(contexto);
  } catch (error) {
    console.log('Virtual DOM failed, falling back to classic');
    return await estrategiaScrollAnonimo(contexto);
  }
}
```

### 8.2 Compatibilidad con Estrategia G Clásica
La Estrategia G clásica (scroll-anon-completo.ts) **NO se modifica** y sigue funcionando como fallback.

### 8.3 Compatibilidad con Otras Estrategias
Todas las estrategias existentes (GraphQL, API Rest, External Service) siguen disponibles como fallbacks adicionales.

## 9. Testing Strategy

### 9.1 Testing Local
1. Implementar componentes individualmente
2. Test unitarios de cada componente
3. Integration tests de flujo completo
4. E2E tests con posts de diferentes tamaños

### 9.2 Testing Render
1. Deploy a ambiente de staging (si disponible)
2. Monitorear memoria con MemoryMonitor
3. Verificar que no ocurra OOM
4. Comparar precisión con Estrategia G clásica

### 9.3 Métricas de Testing
- Memory usage por chunk
- Total memory usage
- Extraction accuracy
- Time to completion
- GC frequency y overhead
