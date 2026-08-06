# 01 - Requerimientos: Captura Completa de Comentarios de Instagram

## Problema Principal

El scraper actual de Instagram (`api/src/collectors/instagram.ts`) **solo captura ~16 comentarios** cuando la publicación tiene **cientos** (en el caso de ejemplo, la publicación `C347268uDMm` tiene al menos ~130+ comentarios visibles manualmente).

### Evidencia del Problema

- **URL de prueba:** `https://www.instagram.com/p/C347268uDMm/?img_index=1`
- **Comentarios capturados por el scraper:** ~16
- **Comentarios reales visibles (copiados manualmente):** ~130+ (con usuarios como `karen_etcheverry`, `mirmili2021`, `cataldovanesa`, `pia_mugetti`, `vicky__gauna`, `_clf.car`, `lalocademierdaok`, `silviafinana`, `noe.bullon_`, `natyy_soria`, `vickybormape`, `dulcementechocolateria`, `ayala_lidia`, `_vincentart`, `silvinaali79`, `guidiazbiosca`, `ile_fuentes22`, `betiyer`, `lacocinnadecoca`, `lau.blanco06`, `cyn.altamirano`, `yafval`, etc.)
- **Lo que SÍ funciona del scraper:** Captura el username correctamente (algo que manualmente con el mouse no se logra fácilmente).
- **Lo que NO funciona:** Solo captura los primeros ~16 comentarios y se detiene.

### Análisis de la Causa Raíz

El scraper actual tiene **2 estrategias**, ambas con limitaciones:

1. **Estrategia principal - API REST interna** (`extraerComentariosApi`):
   - Usa `api/v1/media/{mediaId}/comments/` con paginación `max_id`.
   - Hace fetch desde Node.js con cookies del navegador.
   - **Problema:** Sin sesión activa de Instagram, esta API devuelve muy pocos comentarios (~16) y luego deja de paginar (`next_max_id` viene `null`).
   - **Problema adicional:** Instagram detecta los requests desde Node.js por TLS fingerprinting y los bloquea.

2. **Estrategia fallback - DOM scraping** (`cargarMasComentariosInstagram`):
   - Abre el modal de comentarios y hace clic en "Load more comments".
   - **Problema:** Sin sesión, Instagram redirige al login cuando se intenta cargar más comentarios. El scraper detecta esto y corta.
   - **Problema adicional:** El DOM parsing es frágil y depende de la estructura HTML que cambia frecuentemente.

## Objetivos (Requerimientos Obligatorios)

1. **Capturar TODOS (o la gran mayoría) de los comentarios** de una publicación pública de Instagram, incluyendo:
   - **Username** del autor del comentario
   - **Texto** del comentario (incluyendo @menciones)
   - Opcionalmente: timestamp del comentario

2. **Sin requerir la API oficial de Instagram** (Instagram Graph API), ya que:
   - Requiere cuenta Business/Creator.
   - Solo permite leer comentarios de publicaciones propias.
   - No sirve para sorteos de publicaciones de terceros.

3. **Sin intervención manual del usuario** para cada sorteo (copiar/pegar NO es aceptable como solución principal).

4. **Compatibilidad con el sistema actual:**
   - Debe mantener la interfaz `Participante[]` (array de `{ usuario: string, comentario: string }`).
   - Debe integrarse con el flujo de `recolectarInstagram()`.
   - No debe romper los flujos existentes de TikTok y YouTube.

5. **Tolerancia a fallos:** Si una estrategia falla, debe intentar la siguiente automáticamente (cascading fallback).

6. **Costos mínimos o cero:** Priorizar soluciones open-source o con free tier generoso.

## Alcance

### Incluido
- Investigación y documentación de múltiples estrategias de captura.
- Implementación de la estrategia principal + fallbacks.
- Mecanismo de "session-aware scraping" (usar sesión de Instagram cuando esté disponible).
- Logging detallado para debugging.
- Tests para validar la captura completa.

### Excluido
- Scraping de comentarios de cuentas privadas.
- Scraping de replies/respuestas anidadas dentro de un comentario (scope futuro).
- Bypass de rate limiting de Instagram a escala industrial.
- Creación de cuentas de Instagram automatizadas.

## Restricciones

- **NO romper** los flujos existentes de sorteos (sección 16 de AGENTS.md).
- **NO usar** la API oficial de Meta/Instagram (requiere cuenta Business + autenticación OAuth).
- **NO almacenar** credenciales de Instagram en el código fuente.
- **Respetar** el sistema de sesión guardada existente (login asistido vía Playwright).
- **Mantener** headless mode para producción (no puede abrir ventanas visibles en el servidor).

## Criterios de Éxito

| Criterio | Umbral Mínimo | Umbral Óptimo |
|----------|---------------|---------------|
| Comentarios capturados (publicación de ~130 comentarios) | ≥ 80% (104+) | 100% (~130+) |
| Tiempo de ejecución | < 120 segundos | < 60 segundos |
| Tasa de éxito (sin sesión) | ≥ 50% de publicaciones | ≥ 80% |
| Tasa de éxito (con sesión) | ≥ 90% | ≥ 99% |
| Compatibilidad con formato existente | 100% | 100% |

## Prioridad de las Estrategias (de mayor a menor)

1. **Intercepción de GraphQL desde el navegador** (Estrategia A) — Más prometedora
2. **API REST con sesión + reintentos inteligentes** (Estrategia B) — Mejora del actual
3. **DOM Scraping con scroll infinito mejorado** (Estrategia C) — Fallback robusto
4. **Servicio externo (Apify/ScrapFly)** (Estrategia D) — Plan de contingencia
5. **Entrada manual mejorada (UX)** (Estrategia E) — Último recurso con mejor UX
