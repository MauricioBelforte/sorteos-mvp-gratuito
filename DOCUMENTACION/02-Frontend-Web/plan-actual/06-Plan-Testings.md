# Plan de Testings - Frontend Web (Mejora de Interfaz Gráfica)

**Fecha:** 2026-08-02
**Alcance:** Componentes UI base (Fase 2) y componentes features (Fase 3) + home refactorizada (Fase 4)

## Objetivo

Verificar que la mejora de interfaz gráfica no rompió la funcionalidad de sorteos y que los nuevos componentes se renderizan correctamente.

## 1. Pruebas de Compilación

| ID | Escenario | Criterio de Éxito |
|----|-----------|-------------------|
| B1 | `npm run build` en web/ | Compilación exitosa, sin errores de tipos |
| B2 | Typecheck del proyecto completo | Todas las páginas (home, auth, dashboard, detalle) compilan |

## 2. Pruebas Unitarias de Componentes (renderizado con react-dom/server)

| ID | Escenario | Criterio de Éxito |
|----|-----------|-------------------|
| U1 | ResultCard con `{ sorteo: { ganadores: [...], hashVerificacion } }` | Renderiza ganador, hash monospace y botón copiar |
| U2 | ResultCard con `{ requierePago: true, precio, moneda, cantidadComentarios }` | Renderiza mensaje, precio formateado y nota de pagos próximamente |
| U3 | ResultCard con `null` | Retorna vacío SIN lanzar excepción |
| U4 | SocialIcons | Renderiza 3 SVGs con aria-label y sin errores |

## 3. Pruebas de Integración (Frontend ↔ Backend)

| ID | Escenario | Criterio de Éxito |
|----|-----------|-------------------|
| I1 | POST /api/sorteos desde SorteoForm con URL de Instagram/TikTok/YouTube | Body correcto: urlPublicacion, redSocial, cantidadGanadores: 1, cantidadSuplentes: 0 |
| I2 | Respuesta `{ sorteo }` del backend | ResultCard de éxito (verde) |
| I3 | Respuesta `{ requierePago }` del backend | ResultCard de pago (amarilla) |
| I4 | Respuesta `{ error }` (ej: 500) | Alert de error con mensaje del servidor |
| I5 | Servidor apagado (error de red) | Alert "Error de conexión con el servidor" |

## 4. Edge Cases

| ID | Escenario | Criterio de Éxito |
|----|-----------|-------------------|
| E1 | URL vacía | Botón deshabilitado |
| E2 | URL sin dominio soportado | Error visual en el input en tiempo real + botón deshabilitado |
| E3 | URL de youtu.be | Detectada como YouTube |
| E4 | Loading durante request | Spinner en botón + inputs deshabilitados |
| E5 | Doble click en submit | Botón deshabilitado mientras loading |
| E6 | Resultado previo + nuevo submit | Resultado se limpia al iniciar nuevo envío |

## 5. Responsive Design (requiere verificación manual)

| ID | Escenario | Criterio de Éxito |
|----|-----------|-------------------|
| R1 | Móvil (< 640px) | Formulario y precios a 1 columna, sin desbordes horizontales |
| R2 | Tablet (640-1024px) | Precios a 2 columnas |
| R3 | Desktop (> 1024px) | Precios a 3 columnas, hero centrado |

## 6. Accesibilidad

| ID | Escenario | Criterio de Éxito |
|----|-----------|-------------------|
| A1 | Iconos sociales | aria-label descriptivo en cada SVG |
| A2 | Botón copiar hash | aria-label "Copiar hash de verificación" |
| A3 | Contraste | Texto principal sobre fondos claros con contraste suficiente (WCAG AA) |
| A4 | Loader | role="status" y aria-label "Cargando" |

## 7. Performance

| ID | Escenario | Criterio de Éxito |
|----|-----------|-------------------|
| P1 | First Load JS de la home | Sin regresiones significativas (objetivo < 100 kB) |
| P2 | Animaciones | fade-in/scale-in de entrada no bloquean interacción |

## Criterios de Aceptación Globales

- Funcionalidad de sorteos intacta (mismo contrato con backend)
- Build sin errores
- Sin errores de consola
- Diseño visual mejorado y consistente
