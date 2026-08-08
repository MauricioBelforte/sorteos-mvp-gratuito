# 07-Resultados-Testings — Módulo 11: Uso de Apify para sorteos de +700

**Autor:** DeepSeek (opencode)  
**Fecha:** 2026-08-08  
**Versión:** 1.0  
**Estado:** En espera: aún NO se ejecutaron los testings (falta validación del actor con sesión)

---

## Estado actual de los testings

| # | Escenario | Resultado | Evidencia |
|---|-----------|-----------|-----------|
| 1 | Actor Apify CON sesión para 750-1000 | ⏳ PENDIENTE — bloqueante. No se habilitó la franja hasta validar | — |
| 2 | Umbral de selector (1000 → Apify / 700 → NO) | ⏳ PENDIENTE (requiere #1 y código) | — |
| 3 | Cuota agotada | ⏳ PENDIENTE | — |
| 4 | Pase Rápido supera cuota | ⏳ PENDIENTE | — |
| 5 | Fallback si Apify falla | ✅ Comportamiento actual verificado: sin `APIFY_TOKEN` devuelve [] y la cascada sigue (vida diaria de hoy) | `external-service.ts`, logs prod |
| 6 | Costos reales | ⏳ PENDIENTE (requiere token con crédito) | — |
| 7 | Sin APIFY_TOKEN | ✅ Verificado: estrategia skip, no gasta, no rompe | `external-service.ts:20` |

## Conclusión parcial

- Hoy **Apify no aporta valor** (sin token ni actor con sesión; tope 200 degrada).
- La franja 750-1000 queda **pendiente de pruebas** hasta:
  1. Activar un actor de Apify con sesión (o cookies) que traiga ~100% de 750-1000.
  2. Medir costo real (~0,86 USD/sorteo).
  3. Bajar `APIFY_CUOTA_MENSUAL` a 5 y agregar el umbral de selector.

## Propuestas de retoques tras el testing (cuando ocurra)

- Si el actor degrada como el actual → considerar `apify~instagram-comment-scraper` con cookies de la cuenta descartable.
- Evaluar si la franja 700+10 1000 suma tráfico real (Fase 2 cupones) antes de optimizar el costo por sorteo.