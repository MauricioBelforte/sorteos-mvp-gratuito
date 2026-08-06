**Modelo:** Devin
**Fecha:** 2026-08-01 23:31:00
**Responde a:** `2026-08-01_23-31-00_1-DEVIN-plan-mejora-ui-extenso.md`

# Prompt de Ejecución para Mejora de Interfaz Gráfica

## Tarea Principal
Mejorar significativamente la interfaz gráfica del MVP Sorteos Gratuitos usando los skills instalados y siguiendo el plan detallado.

## Instrucciones de Ejecución

### 1. Invocar Skills Antes de Comenzar
```bash
skill invoke web-design-guidelines
skill invoke ui-ux-pro-max
skill invoke vercel-react-best-practices
skill invoke nextjs-app-router-patterns
```

### 2. Leer el Plan Completo
Lee completamente el archivo `2026-08-01_23-31-00_1-DEVIN-plan-mejora-ui-extenso.md` para entender todas las especificaciones técnicas.

### 3. Ejecutar Fases Secuencialmente

#### Fase 1: Sistema de Diseño
- Crear `web/app/globals.css` con variables CSS
- Crear `web/lib/theme.ts` con configuración de tema
- Crear componentes base en `web/components/ui/`
- Actualizar `web/app/layout.tsx` con nuevo sistema

#### Fase 2: Mejora Visual de Home
- Rediseñar header/hero section
- Mejorar formulario de sorteos
- Mejorar visualización de precios
- Mejorar visualización de resultados

#### Fase 3: Responsive Design
- Implementar mobile-first
- Optimizar touch interactions
- Test en diferentes breakpoints

#### Fase 4: Animaciones
- Implementar sistema de animaciones
- Agregar micro-interacciones
- Optimizar performance

#### Fase 5: Accesibilidad
- Implementar ARIA labels y roles
- Optimizar navegación por teclado
- Validar contraste de colores

#### Fase 6: Performance
- Implementar code splitting
- Optimizar imágenes
- Minificar CSS

### 4. Validación y Testing
- Verificar funcionalidad existente no se rompe
- Test responsive design
- Validar accesibilidad
- Test performance con Lighthouse

### 5. Documentación
- Actualizar `DOCUMENTACION/02-Frontend-Web/plan-actual/`
- Generar log de cambios en `Logs/`
- Actualizar `ESTADO-PARALELO.md`

## Criterios de Éxito Obligatorios

- ✅ Funcionalidad de sorteos no se rompe
- ✅ Responsive design funciona en todos los breakpoints
- ✅ Animaciones son suaves y no afectan performance
- ✅ Accesibilidad cumple con WCAG AA
- ✅ Lighthouse score > 90
- ✅ Sin errores de consola ni warnings

## Restricciones Importantes

1. **No romper funcionalidad existente:** El flujo de sorteos debe seguir funcionando
2. **Seguir AGENTS.md:** Mantener todas las reglas del proyecto
3. **Documentar cambios:** Cada cambio debe documentarse según AGENTS.md
4. **Usar skills instalados:** Aprovechar los skills para mejores prácticas
5. **Testing obligatorio:** Verificar todo antes de dar por completada la tarea

## Archivos de Referencia

- Plan detallado: `2026-08-01_23-31-00_1-DEVIN-plan-mejora-ui-extenso.md`
- Código actual: `web/app/page.tsx`
- Skills instalados: `\.agents\skills\`
- Documentación: `DOCUMENTACION/02-Frontend-Web/`
- Reglas: `AGENTS.md`

## Comenzar Ejecución

Una vez leas este prompt y el plan detallado, comienza la ejecución invocando los skills y siguiendo las fases secuencialmente. Documenta cada paso y valida los criterios de éxito.
