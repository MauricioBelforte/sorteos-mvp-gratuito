# 02-Analisis — Módulo 11: Uso de Apify para sorteos de +700 comentarios

**Autor:** DeepSeek (opencode)  
**Fecha:** 2026-08-08  
**Versión:** 1.0  
**Estado:** Plan Inicial

---

## 1. Análisis del dominio

### Capturas probadas (2026-08-08)

| Vía | Rango útil | Costo | Evidencia |
|-----|-----------|-------|-----------|
| Anónimo + Chromium embebido (G-Zero) | ≤300 | $0 | 144/152 (95%) en prod |
| Sesión guardada del dueño | 300-700 | $0 | 611/1035 sin OOM en prod |
| Sesión + más RAM (plan pago) | hasta 2393 | ~25 USD/mes | 2393/2399 (97%) |
| Apify (crédito) | 700-1000 (meta) | 0.75 USD/1000 + ~0.11 corrida | NO probado aún con sesión |

### Cuota de negocio

- Plan free Apify = **US$5/mes** (no se acumula, no se pueden comprar más
  créditos en free, se bloquea al agotarse).
- Sorteo de 1000 comentarios ≈ 0.75 + 0.11 ≈ **0.86 USD** → **~5-6 sorteos
  grandes por mes** con el free.

## 2. Decisiones

### Decisión 1: umbral de Apify en 750 (no 800)

| Razón |
|-------|
| 600-700 es el techo probado con sesión sin OOM; el margen entre 700-800 es la franja gris donde la RAM se arriesga. |
| Cortar en 750 da margen: 300-750 con sesión (cómodo), 750+ con Apify. |
| 750 vs 800 = diferencia mínima de costo (0.56 vs 0.6 USD) → mejor segura. |

### Decisión 2: el visitante jamás paga Apify (en el plan gratis)

| Modelo | Detalle |
|--------|---------|
| Sorteo ≤750 | Siempre gratis vía Render ($0) |
| Sorteo 751-1000 en cuota | Gratis para el visitante; lo absorbe el negocio con crédito Apify |
| Sorteo 751-1000 sin cuota | Bloqueo con CuotaAgotadaError → sugerir Pase Rápido (pago) o volver mañana |
| Pase Rápido pagado | `paseAprobado=true` → corre sin depender de cuota (ingreso del negocio) |

## 3. Alternativas analizadas y descartadas

| Alternativa | Por qué NO |
|-------------|-----------|
| Subir el plan de Render (US$25/mes) | Arregla todo (97% probado) pero convierte el MVP en deuda mensual alta |
| Habilitar sesión de cada usuario (front) | Mucho más técnico y confuso para el visitante; con riesgo de ban por cuenta propia (aunque es una ventaja de severance); requeriría UI y onboarding |
| Apify para TODOS los posts | Gasta crédito inútilmente en posts chicos que ya salen gratis |
| Capturar parcial + avisar (borroso) | Rompe la promesa "hasta 1000" y daña marca |

## 3. Fases de negocio (roadmap visual)

```
FASE 1 (ahora): SEO / tráfico orgánico por Google — el usuario llega solo.
└─ Sin cupones, sin promociones. Medir que la gente use la herramienta gratis (≤750).

FASE 2 (más adelante): CUPONES para sorteos gratis de 1000 comentarios.
└─ Regalos por Instagram a quien siga la cuenta (@soloke va).
└─ El cupón activa `paseAprobado` estilo promocional para un sorteo grande sin gastar $5.
└─ Sirve para: medir retención, viralidad, y validar el pipeline Apify real con tráfico controlado.

Fase 3 (si funciona): validar monetización de la franja 751-1000 vía Pase Rápido.
```

## 4. Riesgos y mitigación

| Riesgo | Mitigación |
|--------|-----------|
| El actor de Apify degrada (>200) | Probar actor CON sesión antes de habilitar; si no hay actor bueno, la franja 750+ espera |
| Superar los US$5/mes | La cuota bloquea automáticamente (CuotaAgotadaError) o pasa a pase pagado |
| Proveedor de actividades (apify `free` no permite comprar extra) | Si el tráfico lo exige, evaluar Starter (US$29/mes incluidos) como inversión de la fase 3 |
| El SEO no atrae usuarios | Esperable en el MVP; los cupones de IG son el plan B de growth (fase 2) |