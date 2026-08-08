# 06-Plan-Testings — Módulo 11: Uso de Apify para sorteos de +700 comentarios

**Autor:** DeepSeek (opencode)  
**Fecha:** 2026-08-08  
**Versión:** 1.0  
**Estado:** Plan de testings (a ejecutar antes de habilitar la franja 750+)

---

## Objetivo

Validar que la franja de sorteos 751-1000 comentarios se captura completa con
Apify (sin tocar Render) y que el gasto de crédito es el esperado, antes de
habilitarlo en producción.

## Escenarios de prueba

### T1 — Actor Apify con sesión (bloqueante)
- **Prerequisito:** APIFY_TOKEN real activo en Render + actor configurado con sesión propia/cookies.
- **Acción:** correr el post de prueba de ~900-1000 comentarios (ej: `C347268uDMm` es 152... usar un post de ~900 si existe).
- **Criterio de éxito:** captura ≥95% (cantidadEsperada) de comentarios únicos top-level, SIN degradar a ~15.
- **Interés:** si el actor actual (maxComments 200) sigue degradando → BLOQUEADO: no se habilita la franja.

### 2 — Umbral de selector
- **Pre:** `APIFY_UMBRAL_CANTIDAD=750`.
- **Acción:** sorteo de 1000 y sorteo de 700.
- **Criterio:** el de 1000 llama a Apify; el de 700 NO (jamás gastar crédito en ≤750).

### 3 — Cuota agotada
- **Pre:** `APIFY_CUOTA_MENSUAL=0.01` (simular agotado).
- **Acción:** sorteo 1000 sin pase.
- **Criterio:** lanza CuotaAgotadaError (mensaje claro en front) y NO llama al actor ni gasta.

### 4 — Pase Rápido supera la cuota
- **Pre:** cuota agotada + paseAprobado=true (compra simulada).
- **Acción:** sorteo 1000.
- **Criterio:** la captura corre con Apify; el paga extra correctamente (se permite).

### 5 — Fallback si Apify falla
- **Acción:** token inválido / actor falla.
- **Criterio:** la cascada cae a sesión/anónimo (Chromium) y guarda al menos parcial; NO se pierde el sorteo (comportamiento en vivo de hoy).

### 6 — Costos reales
- **Acción:** correr una captura de 1000 y observar el dashboard de Apify.
- **Criterio:** costo por corrida ≈ 0.75 USD (actor por resultados) + ~0.11 USD plataforma; documentarlo de nuevo en el check de esta plan.

### 7 — Sin APIFY_TOKEN
- **Acción:** ejecutar sin token (estado actual en Render).
- **Criterio:** `estrategiaServidorExterno` devuelve [] y NO rompe la cascada (comportamiento actual garantizado).

## Criterio de aceptación general
- Ruta corta: 5-6 sorteos de 1000 por mes (US$5 free) sin pérdidas.
- Ningún cambio rompe los flujos ≤750 (comparar antes/después de habilitar el umbral).

## Datos de referencia
- Costo sorteo 1000 ≈ 0,86 USD (0.75+0.11)
- Cuota free / mes: US$5 (no se acumula; usados bloqueado si se agota)
- Post de prueba chico conocido: `C347268uDMm` (152 esperados)