# 06 - Plan de Testings - Módulo de Mejoras UI

**Alcance:** Endpoint de análisis, wizard de sorteo, animación de ruleta, ResultCard multi-ganadores.

## 1. Backend - Endpoint `/api/sorteos/analizar`

| ID | Escenario | Criterio de Éxito |
|----|-----------|-------------------|
| B1 | POST con URL de Instagram válida | Responde con cantidadComentarios, participantes[], imagen y precio |
| B2 | POST con URL de YouTube | Imagen = thumbnail `img.youtube.com/vi/ID/hqdefault.jpg` |
| B3 | POST con red social inválida | 400 con mensaje de error |
| B4 | POST sin urlPublicacion/redSocial | 400 "Datos incompletos" |
| B5 | Publicación sin comentarios | 500 con error claro (comportamiento pre-existente) |
| B6 | Endpoint de creación NO modificado | POST `/api/sorteos` sigue funcionando con el contrato original |

## 2. Frontend - SorteoWizard

| ID | Escenario | Criterio de Éxito |
|----|-----------|-------------------|
| W1 | Analizar publicación exitoso | Muestra imagen, cantidad de comentarios y selects |
| W2 | Analizar con URL no soportada | Error visual en el input |
| W3 | Analizar con servidor caído | Alert "Error de conexión" |
| W4 | Cambiar ganadores/suplentes | Selects actualizan estado |
| W5 | Límites: ganadores 1-10, suplentes 0-10 | Selects solo permiten rango válido |
| W6 | Sortear con loading | Botón deshabilitado + spinner, sin doble click |
| W7 | Resultado requiere pago | Muestra mensaje de pago (animación NO se ejecuta) |
| W8 | Resultado sorteo gratis | Animación se ejecuta y frena en el ganador |

## 3. Animación RuletaGanadores

| ID | Escenario | Criterio de Éxito |
|----|-----------|-------------------|
| R1 | 1 ganador | Gira ~3.5s, frena exactamente en ganador[0] |
| R2 | 3 ganadores | Secuencia de 3 vueltas, cada una frena en su ganador |
| R3 | prefers-reduced-motion | Muestra el ganador directamente sin animación |
| R4 | Participantes con pocos elementos (<5) | Repite la lista hasta completar la duración mínima |
| R5 | onTerminar | Se ejecuta al terminar la última vuelta |

## 4. ResultCard multi-ganadores

| ID | Escenario | Criterio de Éxito |
|----|-----------|-------------------|
| C1 | 1 ganador, 0 suplentes | Renderiza como antes (sin regresión) |
| C2 | 2+ ganadores | Muestra lista numerada de ganadores |
| C3 | Con suplentes | Muestra suplentes en sección secundaria |
| C4 | null | No renderiza ni lanza errores |

## 5. Regresiones

| ID | Escenario | Criterio de Éxito |
|----|-----------|-------------------|
| G1 | Build frontend | `npm run build` exitoso |
| G2 | Build backend | `npx tsc --noEmit` exitoso |
| G3 | Home renderiza | Status 200 con wizard, precios y redes sociales |

## Criterios de Aceptación Globales

- Todos los requerimientos del usuario (imagen, comentarios, ganadores, suplentes, botón, animación, premium) implementados
- Sin regresiones en el flujo existente
- Sin errores de consola ni warnings
