# 02 - Análisis - Módulo de Mejoras UI

## Análisis del Dominio

### Flujo actual
1. Pegar URL → POST `/api/sorteos` → respuesta (requierePago | sorteo) → ResultCard.

### Flujo propuesto (2 pasos premium)
1. **Paso 1 - Analizar publicación:** pegar URL → POST `/api/sorteos/analizar` → devuelve cantidad de comentarios, lista de participantes y imagen de la publicación.
2. **Paso 2 - Configurar y sortear:** preview (imagen + contador de comentarios) + selectores de ganadores/suplentes + botón "Sortear" → POST `/api/sorteos` (existente, con la cantidad elegida) → animación de ruleta que recorre los participantes → frena en el/los ganador/es reales → ResultCard premium.

## Alternativas Consideradas

### A. Imagen de la publicación
| Alternativa | Pros | Contras | Decisión |
|-------------|------|---------|----------|
| Extraer `og:image` con Playwright | Imagen real de la publicación | Lento, puede fallar en Instagram (bloqueos) | Usado como estrategia principal |
| Thumbnail directo por red (YouTube `img.youtube.com/vi/ID/hqdefault.jpg`) | Rápido, sin scraping | No aplica a Instagram/TikTok | Usado para YouTube |
| Fetch HTML + regex de meta tags | Rápido | Instagram no sirve HTML sin JS | Fallback |

**Decisión:** helper `extraerImagenPublicacion(url, redSocial)` con estrategias por red: YouTube thumbnail directo, Instagram/TikTok vía og:image (Playwright/fetch), con fallback a una imagen genérica de la red.

### B. Animación de ruleta
| Alternativa | Pros | Contras | Decisión |
|-------------|------|---------|----------|
| Interval + easing manual con `requestAnimationFrame` | Control total del frenado en el ganador exacto, funciona con ganadores múltiples | Implementación manual | **ELEGIDA** |
| CSS translateY de lista duplicada | Suave | Difícil frenar exactamente en un índice | Descartada |
| Librería externa (framer-motion) | Rápido | Dependencia nueva, no instalada | Descartada |

**Decisión:** componente `RuletaGanadores` que recorre los participantes con un nombre visible (efecto slot machine), desacelera con easing y frena en el ganador real devuelto por el servidor. Soporta múltiples ganadores (una vuelta por ganador). Respeta `prefers-reduced-motion` (si el usuario lo pide, salta directo al resultado).

### C. Multi-ganadores en ResultCard
**Decisión:** `ResultCard` muestra la lista completa de ganadores (y suplentes si existen) sin romper el caso actual de 1 ganador.

## Decisiones de Arquitectura

1. **Backend:** nuevo router `preview.ts` montado en `/api/sorteos/analizar` (endpoint NUEVO; no se modifica el POST existente - regla 15).
2. **Frontend:** nuevo componente `SorteoWizard` (flujo completo) + `RuletaGanadores` (animación). El `SorteoForm` existente NO se modifica.
3. **Helpers compartidos:** `web/lib/sorteos.ts` con detección de red social, análisis y creación de sorteo.
4. **Seguridad:** el backend limita ganadores (1-10) y suplentes (0-10); valida que la URL sea soportada.
