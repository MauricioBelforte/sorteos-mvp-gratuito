# 07 - Guía de Implementación para el Modelo Ejecutor

## Contexto para el Modelo que Ejecutará la Implementación

Este documento es una **guía de implementación paso a paso** diseñada para que otro modelo de IA (o desarrollador) pueda ejecutar la implementación del sistema de captura completa de comentarios de Instagram.

---

## Antes de Empezar: Lectura Obligatoria

1. **Leer** `AGENTS.md` en la raíz del proyecto (reglas globales).
2. **Leer** los 6 documentos anteriores de esta carpeta `Propuesta Claude/`:
   - `01-Requerimientos.md` — Qué se necesita resolver
   - `02-Analisis.md` — Por qué falla y las 5 alternativas
   - `03-Diseno.md` — Arquitectura y diagramas
   - `04-Codigo.md` — Pseudocódigo detallado de cada archivo
   - `05-Checklist.md` — Lista de tareas con checkboxes
   - `06-Plan-Testings.md` — Todos los tests a ejecutar
3. **Leer** el archivo actual del scraper: `api/src/collectors/instagram.ts` (495 líneas).
4. **Leer** el orquestador: `api/src/collectors/index.ts` (97 líneas).
5. **NO modificar** `instagram.ts` (principio de modularización, regla 15 AGENTS.md).

---

## Orden de Implementación Recomendado

### Paso 1: Crear la infraestructura de archivos

```
api/src/collectors/
├── strategies/
│   ├── types.ts              ← CREAR PRIMERO
│   ├── graphql-intercept.ts  ← Estrategia A
│   ├── api-rest-inbrowser.ts ← Estrategia B
│   ├── dom-scroll.ts         ← Estrategia C
│   └── external-service.ts   ← Estrategia D
├── parsers/
│   └── instagram-paste.ts    ← Estrategia E (parser)
├── instagram-v2.ts           ← Orquestador principal
└── (instagram.ts)            ← NO TOCAR
```

**Acción:** Crear las carpetas `strategies/` y `parsers/` dentro de `api/src/collectors/`.

### Paso 2: Implementar `strategies/types.ts`

Definir la interfaz `ContextoScraping` que todas las estrategias reciben:

```typescript
import { Page } from 'playwright';
import { Participante } from '../types';

export interface ContextoScraping {
  page: Page;
  url: string;
  shortcode: string;
  mediaId: string | null;
  autorExcluido: string;
  cantidadMaxima: number;
  tieneSesion: boolean;
  cantidadEsperada: number | null;
}

export type EstrategiaFn = (ctx: ContextoScraping) => Promise<Participante[]>;
```

### Paso 3: Implementar Estrategia A (`graphql-intercept.ts`)

Esta es la **estrategia más importante**. Ver pseudocódigo completo en `04-Codigo.md`.

**Puntos clave:**
- El listener `page.on('response')` debe registrarse **ANTES** de navegar o abrir el modal.
- Buscar en **múltiples paths** del JSON (Instagram cambia la estructura).
- El listener no "scrollea" — el loop de scroll es separado.
- Usar un buffer compartido entre el listener y el loop de scroll.

**Consideración crítica:** El listener es asíncrono. No intentar `await response.json()` dentro del listener si la respuesta ya fue consumida. Usar try/catch.

### Paso 4: Implementar Estrategia B (`api-rest-inbrowser.ts`)

**Cambio clave vs. el código actual:**
- Usar `page.evaluate(async () => fetch(...))` en vez de `fetch()` desde Node.js.
- Esto elimina el problema de TLS fingerprinting.
- Solo intentar si hay sesión activa (sin sesión, esta estrategia no mejora el actual).

### Paso 5: Implementar Estrategia C (`dom-scroll.ts`)

- Portar la lógica de `cargarMasComentariosInstagram()` y `extraerParesDOM()` del archivo original.
- **Mejorar** con scroll humanizado (velocidad variable + delays aleatorios).
- **Agregar** `MutationObserver` para detectar nuevos comentarios sin polling del DOM.

### Paso 6: Implementar Estrategia D (`external-service.ts`)

- Integración con Apify (o similar).
- **Debe funcionar solo si `APIFY_TOKEN`** está configurado en `.env`.
- Si no está configurado, retornar `[]` inmediatamente sin error.
- Agregar `APIFY_TOKEN` al `.env.example`.

### Paso 7: Implementar Parser Manual (`parsers/instagram-paste.ts`)

- Este es el parser para la Estrategia E (texto pegado manualmente).
- Es **independiente del backend** — se puede exportar y usar también en el frontend.
- Ver la función `parsearTextoInstagramPegado()` en `04-Codigo.md`.
- **Test inmediato:** Usar el texto de los ~130 comentarios que el usuario proporcionó en el request.

### Paso 8: Implementar el Orquestador (`instagram-v2.ts`)

- Importar todas las estrategias.
- Reutilizar funciones de `instagram.ts`: `esUsernameValido`, `obtenerAutorInstagram`, `obtenerMediaId`, `aceptarConsentimiento`.
- **No copiar-pegar** esas funciones — importarlas. Si no se pueden importar porque no están exportadas, agregarles `export` al archivo original (ese es el ÚNICO cambio permitido en `instagram.ts`).
- Implementar la cascada: A → B → C → D.
- Si ninguna supera el umbral, retornar el mejor resultado obtenido.

### Paso 9: Modificar `index.ts`

- Cambiar una sola línea:

```diff
- import { recolectarInstagram, validarUrlInstagram } from './instagram';
+ import { recolectarInstagramV2 as recolectarInstagram, validarUrlInstagram } from './instagram-v2';
```

- Mantener `validarUrlInstagram` importado del archivo original si `instagram-v2.ts` lo re-exporta.

### Paso 10: Testing

Seguir el plan de testing en `06-Plan-Testings.md`.

**Prioridad de tests:**
1. Tests unitarios del parser (U1-U10) — Para validar rápidamente.
2. Test de integración I1 (URL de prueba sin sesión) — Para ver si mejora.
3. Test de integración I2 (URL de prueba con sesión) — Para ver la mejora máxima.
4. Tests de regresión I11-I13 — Para asegurar que no se rompió nada.

---

## Errores Comunes a Evitar

### 1. Hacer fetch desde Node.js
```typescript
// ❌ NUNCA hacer esto (el código actual hace esto y por eso falla)
const res = await fetch(url, { headers: { Cookie: cookies } });

// ✅ SIEMPRE hacer esto
const data = await page.evaluate(async () => {
  const res = await fetch(url, { credentials: 'include' });
  return res.json();
});
```

### 2. No registrar el listener antes de navegar
```typescript
// ❌ Error: registrar después de navegar (se pierden los primeros responses)
await page.goto(url);
page.on('response', handler); // ← Tarde

// ✅ Correcto: registrar ANTES
page.on('response', handler); // ← Antes
await page.goto(url);
```

### 3. No deduplicar entre estrategias
```typescript
// ❌ Error: sumar resultados sin deduplicar
return [...resultadoA, ...resultadoB];

// ✅ Correcto: deduplicar
return deduplicar([...resultadoA, ...resultadoB]);
```

### 4. Modificar instagram.ts
```
❌ NUNCA modificar instagram.ts directamente
   (excepto agregar "export" a funciones que se reutilizan)
   
✅ Crear instagram-v2.ts como archivo nuevo
```

### 5. Ignorar el login wall
```typescript
// ❌ Error: seguir scrolleando después de que IG pide login
// → El DOM se destruye y se obtienen datos basura

// ✅ Correcto: detectar y cortar
const pideLogin = await page.evaluate(() => 
  location.href.includes('/accounts/login')
);
if (pideLogin) break; // Retornar lo que se tenga
```

---

## Variables de Entorno Nuevas (Opcionales)

Agregar al `.env.example`:

```env
# [OPCIONAL] Token de Apify para el servicio de scraping externo (Estrategia D)
# Solo necesario si se quiere usar el servicio externo como fallback
APIFY_TOKEN=

# [OPCIONAL] Token de ScrapFly como alternativa a Apify
SCRAPFLY_TOKEN=
```

---

## Criterios de "Listo para PR"

Antes de considerar la implementación terminada:

1. ✅ `npm run dev` en la API levanta sin errores.
2. ✅ `npm run dev` en la web levanta sin errores.
3. ✅ La URL de prueba (`C347268uDMm`) captura ≥ 50 comentarios (sin sesión).
4. ✅ La URL de prueba captura ≥ 100 comentarios (con sesión).
5. ✅ TikTok y YouTube siguen funcionando.
6. ✅ El parser manual funciona con el texto de ejemplo del usuario.
7. ✅ No hay cambios en `instagram.ts` (excepto agregar `export`).
8. ✅ Log generado en `Logs/`.
9. ✅ Documentación actualizada en `plan-actual/`.
10. ✅ Checklist actualizado en `05-Checklist.md`.

---

## Resumen de la Propuesta

| Aspecto | Actual | Propuesto |
|---------|--------|-----------|
| Comentarios capturados | ~16 | ≥ 100 (objetivo) |
| Estrategias | 2 (API REST + DOM) | 5 (cascada A→B→C→D→E) |
| TLS fingerprinting | Vulnerable | Resuelto (fetch in-browser) |
| Login wall | Bloquea | Detecta y maximiza sin sesión |
| Mantenimiento | Bajo | Medio (monitorear GraphQL) |
| Fallback manual | No existe | Parser inteligente de texto pegado |
| Archivos nuevos | 0 | 7 |
| Archivos modificados | 0 | 1 (index.ts — 1 línea) |
| Archivos eliminados | 0 | 0 |
| Riesgo de regresión | - | Muy bajo (modularización) |
