# 01-Requerimientos — Módulo 11: Uso de Apify para sorteos de +700 comentarios

**Autor:** DeepSeek (opencode)  
**Fecha:** 2026-08-08  
**Versión:** 1.0  
**Estado:** Plan Inicial — pendiente de implementación

---

## 1. Problema

La web promete "sorteos gratis hasta 1000 comentarios", pero el Render free
(512 MB) solo permite de forma gratis y estable:

- ≤300 comentarios: sin sesión (anónimo + Chromium embebido) ✅
- 300-700: con la sesión guardada del dueño ✅ (verificado: 611/1035 sin OOM)
- **700+: NO hay vía gratuita con la infra actual** ❌

Por encima de ~700 la RAM del contenedor free explota (OOM) y la captura muere.

## 2. Objetivo

- Seguir ofreciendo el plan **gratis hasta 1000 comentarios** sin romperlo.
- Usar **Apify SOLO cuando el sorteo lo requiere** (más de ~750-800 comentarios),
  manteniendo Render gratis para todo lo demás.
- Que el gasto de crédito de Apify sea **excepcional** (no para sorteos chicos).

## 3. Alcance

| Incluido | No incluye |
|----------|-----------|
| Definir el umbral exacto (750 vs 800) y la lógica de decisión | Conectar Apify de forma definitiva (se hará cuando se decida) |
| Documentar costos reales y cuota mensual | Probar end-to-end en prod (pendiente) |
| Definir la estrategia de negocio por fases (SEO → cupones) | Cambios al flujo de scraping de Chromium |

## 4. Restricciones y Condiciones

1. **Apify de modelo de negocio:** el visitante NO paga nunca. El "gratis" lo
   absorbe el negocio con los US$5/mes de crédito free de Apify, la cuota está
   auto-administrada en `api/src/lib/cuota.ts` (`APIFY_CUOTA_MENSUAL`).
2. **Los US$5 de Apify free no se acumulan entre meses y sin tarjeta NO se
   pueden comprar más créditos** → al agotarse, la franja 700+ se bloquea
   (CuotaAgotadaError) o exige pase pagado (`paseAprobado`).
3. El límite de `maxComments: 200` actual del actor impide sorteo grande;
   antes de habilitar la franja hay que probar un **actor con sesión** (su
   propia cuenta / cookies) que traiga TODOS los comentarios de 750-1000.
4. Baja de 750 comentarios NUNCA se toca Apify.
5. Los sorteos 700-1000 pasan a ser los únicos usuarios del crédito.

## 5. Criterios de aceptación

- Un sorteo de 900 comentarios se captura completo (≥95 %) sin tocar Chromium.
- Un sorteo de 400 comentarios NUNCA gasta crédito (sigue anónimo + sesión).
- La cuota se agota de forma correcta (bloqueo o pase, sin cargos raros).
- Se lleva registro del crédito gastado por sorteo (registrarUsoApify).

## 6. Estado actual del credenciales

- `APIFY_TOKEN` NO está activo en Render → la estrategia Apify hoy ni se invoca
  (return [] si no hay token) → no se gasta nada.
- El actor actual `instax~instagram-only-0-75...` con maxComments 200 degrada.
- La cuota `CUOTA_MENSUAL` default del código es 45 (debiera ser 5 para alinear
  con el free de Apify).