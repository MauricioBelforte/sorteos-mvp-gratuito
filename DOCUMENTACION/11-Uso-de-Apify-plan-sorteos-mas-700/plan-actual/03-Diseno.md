# 03-Diseno — Módulo 11: Uso de Apify para sorteos de +700 comentarios

**Autor:** DeepSeek (opencode)  
**Fecha:** 2026-08-08  
**Versión:** 1.0  
**Estado:** Plan Inicial

---

## 1. Arquitectura de decisión (diagrama)

```
Usuario pega el URL del sorteo
        │
        ▼
POST /api/sorteos/analizar (sorteos-service.ts)
        │
        ▼
┌──────────────────────────────────────────────┐
│  Detección de la cantidad esperada           │
│  (comment_count que devuelve IG / preview)   │
└──────────────────────────────────────────────┘
        │
        ▼
   ¿cantidadEsperada > UMBRAL_APIFY (750)?
        │
     ┌──┴──┐
     │ Si │ No
     ▼    ▼
  FRANJA   FLUJO ACTUAL (sin tocar):
  APIFY    anónimo ≤300 / sesión 300-750
     │
     ▼
┌──────────────────────────┐
│  ¿Cuota disponible?      │
│  (cuota.ts)              │
└──────────────────────────┘
     │
   ┌─┴─┐
   │No │ Si
   ▼   ▼
CuotaAgotadaError    Estrategia externa → Apify
(pide pase pago)        (external-service.ts con actor+sesión)
        │                    ▼
        │               registrarUsoApify()
        │                    │
        │                    ▼
        │           Comentarios completos (750-1000)
        └── si Apify falla → fallback a sesión/anónimo
```

## 2. Cambios propuestos en el código (pendientes de implementación)

| Archivo | Cambio |
|---------|--------|
| `api/src/lib/cuota.ts` | `CUOTA_MENSUAL` default 45 → 5 (alinear con free de Apify) |
| `api/src/lib/cuota.ts` | Exponer una función `franjaApify(cantidadEsperada): boolean` (umbral 750 configurable por env) |
| `api/src/collectors/instagram-v2.ts` | En el selector de estrategia: si `cantidadEsperada > UMBRAL_APIFY` → priorizar `estrategiaServicioExterno` (Apify) antes que Chromium clásico |
| `api/src/collectors/strategies/external-service.ts` | Reemplazar/reconfigurar el actor para soportar 750-1000 con sesión (pendiente de pruebas) y subir a `maxComments` casi 1000+; verificar que no degrade |
| `external-service.ts` | Llámete `registrarUsoApify()` — ya se hace; verificar granularidad por sorteo |

> **Importante:** estos cambios NO se implementan todavía (Módulo 11 está en fase de
> plan/validación). Primero se prueba el actor Apify con sesión (plan de testings).

## 3. Flujo del Pase Rápido (sorteo sin cuota)

```
Sorteo 751-1000 sin cuota
        │
        ▼
CuotaAgotadaError
        │
        ▼
Front: "El límite gratuito se agotó hoy → comprá un Pase Rápido o probá mañana"
        │
        ▼
Pago (MercadoPago) → paseAprobado=true (ya existe endpoint)
        │
        ▼
Flujo Apify corre igual (registraUsoApify se evita/ignora con pase)
```

## 3. Variables de entorno nuevas

```bash
# Umbral a partir del cual un sorteo "bloquea" a Apify (default 750)
APIFY_UMBRAL_CANTIDAD=750
# Cuota mensual de Apify en dólares (default 5, alineada con el free de Apify)
APIFY_CUOTA_MENSUAL=5
```

## 4. Estrategia de negocio por fases (flujo)

### Fase 1 (ahora)
- SEO por Google (keywra incluidas en metadata del front).
- Sin regalos ni descuentos. Medir uso.
- Captura ≤750 con Render gratis (anónimo + sesión).

### Fase 2 (post-lanzamiento)
- Cupones para sorteos gratis de **1000 comentarios**: se regalan por Instagram
  a cambio de un follow (@solokeh).
- El cupón se canjea en la web → activa `paseAprobado` promocional en ese sorteo
  → los 1000 comentarios corren por Apify con el crédito del negocio.
- Objetivo: probar la franja 751-1000 ME con tráfico real SIN hacer público el
  costo, medir conversación y viralidad del sorteo premiado.

### Fase 3 (si el free se agota por tráfico)
- Evaluar Pase Rápido pagado como monetización de la franja y/o plan Starter
  (29 USD/mes incluidos).

## 5. Lo que NO se toca

- La Estrategia G-Zero/Chromium anónimo (≤300) y la vía con sesión (300-750).
- El pago/principio de transparencia del sorteo.
- El código de la fila solo se agrega el salto a Apify en la franja alta.