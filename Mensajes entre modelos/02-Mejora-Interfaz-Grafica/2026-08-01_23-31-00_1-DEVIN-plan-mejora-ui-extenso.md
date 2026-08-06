**Modelo:** Devin
**Fecha:** 2026-08-01 23:31:00
**Responde a:** N/A (mensaje inicial de planificación)

# Plan Detallado para Mejora de Interfaz Gráfica - MVP Sorteos Gratuitos

## Contexto del Proyecto

**Proyecto:** MVP Sorteos Gratuitos  
**Estado Actual:** Funcional, interfaz básica funcional  
**Stack Tecnológico:** Next.js 14, React 18, TypeScript, CSS puro  
**Objetivo:** Mejorar significativamente la interfaz gráfica usando skills instalados

## Skills Instalados Disponibles

### 1. web-design-guidelines (Vercel Labs)
- **Ubicación:** `\.agents\skills\web-design-guidelines`
- **Propósito:** Directrices de diseño web profesional
- **Capacidades:** Principios de UI/UX modernos, diseño responsive, mejores prácticas

### 2. ui-ux-pro-max (NextLevelBuilder)
- **Ubicación:** `\.agents\skills\ui-ux-pro-max`
- **Propósito:** Skill especializado en UI/UX avanzado
- **Capacidades:** Patrones de diseño modernos, optimización de experiencia de usuario

### 3. design-guide (Paperclip AI)
- **Ubicación:** `\.agents\skills\design-guide`
- **Propósito:** Guía completa de diseño
- **Capacidades:** Principios de diseño visual, tendencias de diseño actuales

### 4. vercel-react-best-practices (Vercel Labs)
- **Ubicación:** `\.agents\skills\vercel-react-best-practices`
- **Propósito:** Mejores prácticas de React
- **Capacidades:** Patrones de componentes reutilizables, optimización de rendimiento

### 5. nextjs-app-router-patterns (WS Hobson)
- **Ubicación:** `\.agents\skills\nextjs-app-router-patterns`
- **Propósito:** Patrones avanzados de Next.js App Router
- **Capacidades:** Estructura de componentes moderna, mejores prácticas de Next.js 14

## Análisis del Estado Actual de la Interfaz

### Archivo Principal: web/app/page.tsx

**Estado actual:**
- Interfaz funcional pero básica
- Estilos inline en componentes
- Sin diseño visual consistente
- Paleta de colores básica
- Sin animaciones ni transiciones
- Responsive básico
- Sin componentes reutilizables

**Problemas identificados:**
1. Estilos inline difíciles de mantener
2. Falta de sistema de diseño consistente
3. Sin jerarquía visual clara
4. Tipografía básica sin personalización
5. Sin estados de carga visuales atractivos
6. Sin micro-interacciones
7. Sin diseño mobile-first optimizado
8. Sin accesibilidad adecuada

## Plan de Mejoras Detallado

### Fase 1: Sistema de Diseño y Estructura

#### 1.1 Crear Sistema de Diseño (Design System)
**Objetivo:** Establecer consistencia visual en toda la aplicación

**Componentes a crear:**
- `web/app/globals.css` - Variables CSS globales
- `web/components/ui/Button.tsx` - Botón reutilizable
- `web/components/ui/Card.tsx` - Tarjeta reutilizable
- `web/components/ui/Input.tsx` - Input reutilizable
- `web/components/ui/Loader.tsx` - Loader animado
- `web/lib/theme.ts` - Configuración de tema

**Especificaciones técnicas:**

**Variables CSS (globals.css):**
```css
:root {
  /* Colores principales */
  --color-primary: #6366f1;
  --color-primary-dark: #4f46e5;
  --color-primary-light: #818cf8;
  
  /* Colores secundarios */
  --color-secondary: #ec4899;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  
  /* Colores neutros */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-bg-tertiary: #f1f5f9;
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-tertiary: #94a3b8;
  
  /* Tipografía */
  --font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  
  /* Espaciado */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  
  /* Bordes */
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.5rem;
  --border-radius-lg: 0.75rem;
  --border-radius-xl: 1rem;
  --border-radius-full: 9999px;
  
  /* Sombras */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  
  /* Transiciones */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;
}
```

**Button Component (Button.tsx):**
```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

// Estilos por variante y tamaño
// Estados: hover, active, disabled, loading
// Animaciones: scale en hover, opacity en disabled
```

**Card Component (Card.tsx):**
```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

// Sombra dinámica en hover
// Bordes redondeados consistentes
// Espaciado interno configurable
```

#### 1.2 Estructura de Componentes
**Nueva estructura:**
```
web/
├── app/
│   ├── layout.tsx (actualizar con diseño system)
│   ├── page.tsx (refactorizar con nuevos componentes)
│   └── globals.css (nuevo sistema de diseño)
├── components/
│   ├── ui/ (componentes base reutilizables)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Loader.tsx
│   │   ├── Badge.tsx
│   │   └── Alert.tsx
│   ├── features/ (componentes específicos del dominio)
│   │   ├── SorteoForm.tsx
│   │   ├── PriceDisplay.tsx
│   │   ├── ResultCard.tsx
│   │   └── SocialIcons.tsx
│   └── layout/ (componentes de layout)
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Container.tsx
└── lib/
    ├── theme.ts
    └── utils.ts
```

### Fase 2: Mejora Visual de la Home Page

#### 2.1 Rediseño de Header/Hero Section
**Objetivo:** Crear una sección hero impactante y profesional

**Especificaciones:**
- Título principal con gradiente de colores
- Subtítulo descriptivo con tipografía jerárquica
- Animación de entrada suave
- Iconos de redes sociales con hover effects
- Responsive: 3 columnas en desktop, 1 en mobile

**Componentes a crear:**
- `web/components/layout/Header.tsx`
- `web/components/features/SocialIcons.tsx`

**Código técnico:**
```typescript
// Header.tsx
- Navbar con logo y navegación
- Hero section con gradiente
- Animación CSS de entrada
- Responsive breakpoints

// SocialIcons.tsx
- Iconos SVG de Instagram, TikTok, YouTube
- Hover effects con scale y color change
- Tooltips con nombre de red social
- Accesibilidad con aria-labels
```

#### 2.2 Mejora del Formulario de Sorteos
**Objetivo:** Hacer el formulario más intuitivo y atractivo

**Especificaciones:**
- Input con placeholder animado
- Icono de red social detectado automáticamente
- Validación visual en tiempo real
- Botón de submit con loading state animado
- Feedback visual inmediato

**Componentes a crear:**
- `web/components/features/SorteoForm.tsx`
- `web/components/ui/Input.tsx`

**Código técnico:**
```typescript
// SorteoForm.tsx
- Estado local para URL y red social
- Detección automática de red social
- Validación de URL con regex
- Animación de carga con spinner
- Manejo de errores con alertas visuales

// Input.tsx
- Floating label animado
- Icono dinámico según tipo
- Estados: focus, error, success
- Accesibilidad con aria-invalid
```

#### 2.3 Visualización de Precios Mejorada
**Objetivo:** Hacer la tabla de precios más visual y atractiva

**Especificaciones:**
- Cards individuales por rango de precio
- Iconos visuales para cada rango
- Gradientes de colores diferenciados
- Hover effects con scale y shadow
- Animación de entrada escalonada

**Componentes a crear:**
- `web/components/features/PriceDisplay.tsx`
- `web/components/ui/Card.tsx`

**Código técnico:**
```typescript
// PriceDisplay.tsx
- Array de objetos con rangos de precios
- Cards con colores diferenciados
- Iconos SVG para cada rango
- Animación de entrada con delay
- Responsive: grid adaptativo
```

#### 2.4 Visualización de Resultados
**Objetivo:** Hacer los resultados más impactantes y confiables

**Especificaciones:**
- Card principal con gradiente para ganador
- Animación de revelación del ganador
- Hash de verificación con estilo de código
- Animación de confeti para sorteo gratuito
- Botón para copiar hash

**Componentes a crear:**
- `web/components/features/ResultCard.tsx`
- `web/components/ui/Alert.tsx`

**Código técnico:**
```typescript
// ResultCard.tsx
- Props para tipo de resultado (gratuito/pago)
- Animación de entrada con scale
- Gradiente de colores según tipo
- Hash con estilo monospace
- Botón de copiar con tooltip

// Alert.tsx
- Variantes: success, error, warning, info
- Iconos SVG según variante
- Animación de entrada slide-in
- Auto-dismiss opcional
```

### Fase 3: Responsive Design y Mobile-First

#### 3.1 Implementación Mobile-First
**Objetivo:** Optimizar la experiencia en dispositivos móviles

**Especificaciones:**
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Grid adaptativo con CSS Grid
- Menú hamburguesa para mobile
- Touch-friendly buttons (mínimo 44px)
- Optimización de imágenes para mobile

**Código técnico:**
```css
/* globals.css */
@media (max-width: 640px) {
  --font-size-base: 0.875rem;
  --spacing-md: 0.75rem;
}

/* Componentes responsive */
.grid-responsive {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
}

@media (min-width: 768px) {
  .grid-responsive {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid-responsive {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

#### 3.2 Optimización de Touch Interactions
**Objetivo:** Mejorar la experiencia táctil en dispositivos móviles

**Especificaciones:**
- Active states para touch
- Prevención de zoom accidental
- Scroll suave con CSS smooth-scroll
- Pull-to-refresh deshabilitado donde no se necesite

**Código técnico:**
```css
/* Touch optimization */
@media (hover: none) {
  .button:hover {
    transform: none;
  }
  
  .button:active {
    transform: scale(0.98);
  }
}

html {
  scroll-behavior: smooth;
  -webkit-tap-highlight-color: transparent;
}
```

### Fase 4: Animaciones y Micro-interacciones

#### 4.1 Sistema de Animaciones
**Objetivo:** Agregar animaciones suaves y profesionales

**Especificaciones:**
- Animaciones de entrada (fade-in, slide-up, scale)
- Transiciones de hover states
- Loading states con spinners
- Animaciones de feedback (success, error)

**Componentes a crear:**
- `web/components/ui/Loader.tsx`
- `web/lib/animations.ts`

**Código técnico:**
```typescript
// animations.ts
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};

export const slideUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.4 }
};

export const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.3 }
};

// Loader.tsx
- Spinner SVG animado
- Variantes de tamaño y color
- Accesibilidad con aria-label
- Overlay opcional
```

#### 4.2 Micro-interacciones
**Objetivo:** Agregar detalles que mejoran la UX

**Especificaciones:**
- Hover effects en todos los elementos interactivos
- Active states para buttons
- Focus states para accesibilidad
- Transiciones suaves en todos los cambios

**Código técnico:**
```css
/* Micro-interactions */
.button {
  transition: all var(--transition-base);
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.button:active {
  transform: translateY(0);
  box-shadow: var(--shadow-md);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
```

### Fase 5: Accesibilidad

#### 5.1 Implementación de Accesibilidad
**Objetivo:** Hacer la aplicación accesible para todos los usuarios

**Especificaciones:**
- Semántica HTML correcta
- ARIA labels y roles
- Navegación por teclado
- Contraste de colores WCAG AA
- Screen reader friendly

**Código técnico:**
```typescript
// Componentes accesibles
<button
  aria-label="Crear sorteo"
  disabled={loading}
  className="button"
>
  {loading ? <Loader /> : 'Crear Sorteo'}
</button>

// Focus management
useEffect(() => {
  if (error) {
    errorRef.current?.focus();
  }
}, [error]);

// Skip link para navegación
<a href="#main" className="skip-link">
  Saltar al contenido principal
</a>
```

### Fase 6: Performance

#### 6.1 Optimización de Performance
**Objetivo:** Asegurar tiempos de carga rápidos

**Especificaciones:**
- Code splitting por componentes
- Lazy loading de componentes pesados
- Optimización de imágenes
- Minificación de CSS
- Tree shaking de unused code

**Código técnico:**
```typescript
// Lazy loading
const ResultCard = dynamic(() => import('./components/features/ResultCard'), {
  loading: () => <Loader />,
  ssr: false
});

// Image optimization
import Image from 'next/image';

<Image
  src="/icon-instagram.svg"
  alt="Instagram"
  width={32}
  height={32}
  loading="lazy"
/>
```

## Instrucciones de Ejecución

### Paso 1: Usar Skills Instalados
Antes de comenzar la implementación, invocar los skills instalados:

```bash
# Usar skill de web-design-guidelines
skill invoke web-design-guidelines

# Usar skill de ui-ux-pro-max
skill invoke ui-ux-pro-max

# Usar skill de vercel-react-best-practices
skill invoke vercel-react-best-practices

# Usar skill de nextjs-app-router-patterns
skill invoke nextjs-app-router-patterns
```

### Paso 2: Crear Sistema de Diseño
1. Crear `web/app/globals.css` con variables CSS
2. Crear `web/lib/theme.ts` con configuración de tema
3. Crear componentes base en `web/components/ui/`
4. Actualizar `web/app/layout.tsx` con nuevo sistema

### Paso 3: Refactorizar Home Page
1. Crear componentes de features en `web/components/features/`
2. Refactorizar `web/app/page.tsx` usando nuevos componentes
3. Implementar animaciones y micro-interacciones
4. Agregar responsive design

### Paso 4: Testing y Validación
1. Verificar responsive design en diferentes breakpoints
2. Validar accesibilidad con herramientas de auditoría
3. Test de performance con Lighthouse
4. Validar cross-browser compatibility

### Paso 5: Documentación
1. Actualizar `DOCUMENTACION/02-Frontend-Web/plan-actual/`
2. Documentar nuevos componentes en `04-Codigo.md`
3. Actualizar checklist en `05-Checklist.md`
4. Generar log de cambios en `Logs/`

## Criterios de Éxito

### Funcionales
- ✅ Todos los componentes funcionan correctamente
- ✅ Responsive design funciona en todos los breakpoints
- ✅ Animaciones son suaves y no afectan performance
- ✅ Accesibilidad cumple con WCAG AA

### Visuales
- ✅ Diseño consistente en toda la aplicación
- ✅ Paleta de colores armoniosa y profesional
- ✅ Tipografía legible y jerárquica
- ✅ Micro-interacciones mejoran la UX

### Técnicos
- ✅ Código sigue mejores prácticas de React
- ✅ Componentes son reutilizables y mantenibles
- ✅ Performance es óptima (Lighthouse score > 90)
- ✅ No hay errores de consola ni warnings

## Notas Importantes

1. **Mantener funcionalidad existente:** No romper el flujo actual de sorteos
2. **Progressive enhancement:** Mejorar sin depender de JavaScript crítico
3. **Backward compatibility:** Asegurar que funcione en navegadores antiguos
4. **Testing extensivo:** Probar en múltiples dispositivos y navegadores
5. **Documentación continua:** Documentar cada cambio en los archivos correspondientes

## Referencias

- Skills instalados en `\.agents\skills\`
- Documentación actual en `DOCUMENTACION/02-Frontend-Web/`
- Código actual en `web/app/page.tsx`
- AGENTS.md para reglas del proyecto
- ESTADO-PARALELO.md para coordinación entre modelos

---

**Este plan está diseñado para ser ejecutado por otro modelo con los skills instalados. Contiene todas las especificaciones técnicas necesarias para implementar una mejora completa de la interfaz gráfica del MVP Sorteos Gratuitos.**
