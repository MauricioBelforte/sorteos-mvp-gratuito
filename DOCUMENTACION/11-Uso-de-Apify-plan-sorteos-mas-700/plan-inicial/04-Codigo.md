# 04-Codigo — Módulo 11: Uso de Aпify para sitios +700

**Autor:** DeepSeek (opencode)  
**Fecha:** 2026-08-08  
**Versión:** 1.0  
**Estado:** Plan Inicial (NO implementado aún)

---

## 1. Archivos REPASADOS (análisis del estado actual)

| Archivo | Qué contiene hoy |
|---------|-----------------|
| `api/src/collectors/strategies/external-service.ts` | Estrategia D (Apify). Actor `instax~instagram-only-0-75-get-post-info---all-comments-replies`; `maxComments: 200`; `scrapeReplies: false`; sin `APIFY_TOKEN` devuelve vacío; usa `cuotaDisponibleHoy()` y `registrarUsoApify()` |
| `api/src/lib/cuota.ts` | `CUOTA_MENSUAL = Number(process.env.APIFY_CUOTA_MENSUAL ?? 45)` → debería ser 5 |
| `api/src/collectors/instagram-v2.ts` | Línea ~89: "D) Apify (si APIFY_TOKEN)" — es el fín de la cascada de estrategias |
| `api/src/collectors/instagram.ts` | Prioridad de cookies pegadas → sesión guardada → anónimo (usado por paraview y G clásica) |
| `api/src/routes/preview.ts` / `sorteos.ts` | Reciben `cookies` y `sessionId` del front (opción avanzada oculta en producción) |

## 2. Cambios PROPUESTOS (futuros, no aplicados)

```typescript
// cuota.ts — propuesta
export const UMBRAL_APIFY = Number(process.env.APIFY_UMBRAL_APIFY ?? 750);
export const CUOTA_MENSUAL = Number(process.env.APIFY_CUOTA_MENSUAL ?? 5);

// instagram-v2.ts — propuesta en el selector
if (cantidadEsperada > UMBRAL_APIFY) {
  const comentarios = await estrategiaServicioExterno(ctx);
  if (comentarios.length >= Math.floor(cantidadEsperada * 0.95)) return comentarios;
  // si no, seguí con la cadena normal (fallback)
}
```

> ⚠️ Esto está como PLAN. No se aplica hasta validar el actor de Apify con sesión
> (ver 06-Plan-Testings).

## 3. Nota de costos (clave de esta estrategia)

| Concepto | Valor |
|----------|-------|
| Crédito free de Apify | **US$5/mes** (no se acumula; sin tarjeta no compras más) |
| Actor 0.75 USD por 1000 resultados | Sorteo 1000 ≈ **0.75 + 0.11 ≈ 0.86 USD** |
| Cuota por mes (free) | ≈ **5-6 sorteos de 1000** |
| Sorteo 2000 (2k) | ≈ **1.5 USD** → MENOS de 4 al mes |
| Sorteo 10000 (10k) | ≈ **7.5 USD → NO ENTRÁ EN EL FREE** (necesita plan pago de Apify) |

## 4. Costo de implementación (estimación)

| Tarea | Complejidad |
|-------|------------|
| Subir el umbral de cuota en código | 10 min (1 línea) |
| Cambiar selector de estrategia en instagram-v2 | 30 min |
| Probar actor Apify de 750-1000 con sesión | 2-4 hs (crédito del free) |
| Front: agregar el estado de "pelado de cuota" existiendo | Ya existe CuotaAgotadaError |
| Fase 2: generador de cupones promocionales (IG) | Nuevo módulo a definir (futuro) |

## 5. Logs relacionados

- Log 47/48 anteriores (documentación de G-Zero y SEO del front).