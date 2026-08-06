# 04 - Código - Módulo de Mejoras UI

## Archivos Involucrados

### Backend (api/)
| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `src/lib/preview.ts` | NUEVO | Helper `extraerImagenPublicacion(url, redSocial)` con estrategias por red |
| `src/routes/preview.ts` | NUEVO | Router `POST /api/sorteos/analizar` |
| `src/index.ts` | MODIFICADO | Montar el router de preview (solo se agrega una línea) |
| `src/collectors/index.ts` | REUTILIZADO | `recolectarComentarios()` para obtener participantes |

### Frontend (web/)
| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `lib/sorteos.ts` | NUEVO | Helpers: `detectarRedSocial`, `analizarPublicacion`, `crearSorteo`, `API_URL` |
| `components/features/SorteoWizard.tsx` | NUEVO | Flujo completo en 2 pasos (analizar → configurar → sortear) |
| `components/features/RuletaGanadores.tsx` | NUEVO | Animación slot machine que frena en el ganador |
| `components/features/ResultCard.tsx` | MODIFICADO | Soporte multi-ganadores y suplentes |
| `app/page.tsx` | MODIFICADO | Usa SorteoWizard en lugar de SorteoForm |

## Funciones Clave

### `api/src/routes/preview.ts`
```typescript
// POST /api/sorteos/analizar
// body: { urlPublicacion, redSocial }
// 1. Valida red social
// 2. extraerImagenPublicacion(url, redSocial)  → imagen
// 3. recolectarComentarios(url, redSocial)      → participantes
// 4. calcularPrecio(cantidad)                   → precio (reutiliza lógica existente)
// 5. resp: { cantidadComentarios, participantes, imagen, requierePago, precio, moneda }
```

### `web/lib/sorteos.ts`
```typescript
export function detectarRedSocial(url: string): string
export async function analizarPublicacion(url: string): Promise<any>  // POST /api/sorteos/analizar
export async function crearSorteo(config: { urlPublicacion, redSocial, cantidadGanadores, cantidadSuplentes }): Promise<any>  // POST /api/sorteos
```

### `web/components/features/RuletaGanadores.tsx`
```typescript
// Props: participantes, ganadores, redSocial, onTerminar
// Animación: rAF/interval con easing, gira por todos los participantes y frena en ganadores[i]
```

### `web/components/features/SorteoWizard.tsx`
```typescript
// Estados: url, analizando, preview, configurando, sorteando, resultado, error
// Paso 1: Input + Button "Analizar publicación"
// Paso 2: preview (imagen, contador comentarios, selects ganadores/suplentes) + Button "Sortear"
// Animación: RuletaGanadores cuando llega el resultado
// Resultado: ResultCard multi-ganadores
```

## Logs Relacionados

- `Logs/08-Mejoras-UI-...`
- Hilo `Mensajes entre modelos/03-Mejoras-UI/`
