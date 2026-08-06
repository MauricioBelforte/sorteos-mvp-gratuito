**Modelo:** Devin
**Fecha:** 2026-08-02 00:10:00
**Responde a:** `2026-08-01_23-31-00_2-DEVIN-prompt-ejecucion.md`

# Instrucciones para Continuar Mejora de Interfaz Gráfica

## Estado Actual del Trabajo

### Fases Completadas
1. ✅ **Fase 1: Sistema de Diseño Base** - COMPLETADO
   - Archivo actualizado: `web/app/globals.css` con variables CSS completas
   - Design system implementado con colores, tipografía, espaciado, sombras, transiciones

2. ✅ **Fase 2: Componentes Base UI** - COMPLETADO
   - Archivos creados:
     - `web/components/ui/Button.tsx` - Botón reutilizable con variantes
     - `web/components/ui/Card.tsx` - Tarjeta reutilizable con hover effects
     - `web/components/ui/Input.tsx` - Input con floating label y estados
     - `web/components/ui/Loader.tsx` - Loader animado con variantes
     - `web/components/ui/Alert.tsx` - Alert con variantes y iconos

### Fase en Progreso
3. 🔄 **Fase 3: Componentes Features** - EN PROGRESO
   - Problema: `web/components/features/SocialIcons.tsx` quedó corrupto con SVG gigante
   - Archivos pendientes de crear:
     - `web/components/features/SorteoForm.tsx` - Formulario de sorteos
     - `web/components/features/PriceDisplay.tsx` - Visualización de precios
     - `web/components/features/ResultCard.tsx` - Card de resultados

### Fases Pendientes
4. ⏳ **Fase 4: Refactorizar Home Page** - PENDIENTE
   - Actualizar `web/app/page.tsx` usando nuevos componentes
   - Mantener toda la funcionalidad existente

5. ⏳ **Fase 5: Responsive Design** - PENDIENTE
   - Implementar mobile-first (ya está parcialmente en globals.css)
   - Verificar responsive en diferentes breakpoints

6. ⏳ **Fase 6: Testing y Validación** - PENDIENTE
   - Verificar funcionalidad de sorteos no se rompe
   - Test responsive design
   - Validar accesibilidad

7. ⏳ **Fase 7: Documentación** - PENDIENTE
   - Actualizar `DOCUMENTACION/02-Frontend-Web/plan-actual/`
   - Generar log de cambios en `Logs/`
   - Actualizar `ESTADO-PARALELO.md`

## Instrucciones Específicas para Continuar

### 1. Corregir SocialIcons.tsx
El archivo `web/components/features/SocialIcons.tsx` quedó corrupto. Debes:
- Eliminar el archivo corrupto
- Crear un nuevo `SocialIcons.tsx` limpio con iconos SVG simples de Instagram, TikTok y YouTube
- Implementar hover effects y accesibilidad

### 2. Crear SorteoForm.tsx
Extraer la lógica del formulario de `web/app/page.tsx` y crear:
- Componente con manejo de estado para URL y red social
- Detección automática de red social
- Validación visual en tiempo real
- Usar componentes UI base (Button, Input, Alert)

### 3. Crear PriceDisplay.tsx
Crear componente para mostrar la tabla de precios con:
- Cards individuales por rango de precio
- Iconos visuales para cada rango
- Gradientes de colores diferenciados
- Grid responsive

### 4. Crear ResultCard.tsx
Crear componente para mostrar resultados con:
- Card mejorada para mostrar ganador
- Animación de revelación
- Hash de verificación con estilo monospace
- Botón para copiar hash

### 5. Refactorizar page.tsx
Una vez creados todos los componentes features:
- Reemplazar estilos inline con componentes nuevos
- Usar los componentes features creados
- Mantener TODA la funcionalidad existente (detección de redes sociales, cálculo de precios, resultados)
- Agregar animaciones de entrada

### 6. Skills Instalados Disponibles
Puedes invocar estos skills para mejores prácticas:
- `skill invoke nextjs-app-router-patterns` - Patrones Next.js 14
- `skill invoke design-guide` - Sistema de diseño Paperclip
- `skill invoke ui-ux-pro-max` - UI/UX profesional
- `skill invoke vercel-react-best-practices` - Mejores prácticas React
- `skill invoke web-design-guidelines` - Directrices de diseño web

### 7. Restricciones Importantes
- **NO romper funcionalidad existente:** El flujo de sorteos debe seguir funcionando
- **Seguir AGENTS.md:** Documentar cambios según reglas del proyecto
- **Testing obligatorio:** Verificar funcionalidad antes de completar
- **Usar Tailwind CSS:** Los componentes usan clases de Tailwind (ya están configuradas en globals.css)

### 8. Criterios de Éxito
- ✅ Funcionalidad de sorteos no se rompe
- ✅ Responsive design funciona en todos los breakpoints
- ✅ Animaciones son suaves y no afectan performance
- ✅ Componentes son reutilizables y mantenibles
- ✅ Sin errores de consola ni warnings
- ✅ Diseño visual significativamente mejorado

## Archivos de Referencia
- Plan detallado: `2026-08-01_23-31-00_1-DEVIN-plan-mejora-ui-extenso.md`
- Código actual: `web/app/page.tsx`
- Skills instalados: `\.agents\skills\`
- Reglas: `AGENTS.md`

## Comenzar Ejecución
1. Corregir `SocialIcons.tsx` corrupto
2. Crear los 3 componentes features pendientes
3. Refactorizar `page.tsx`
4. Verificar funcionalidad
5. Documentar cambios
