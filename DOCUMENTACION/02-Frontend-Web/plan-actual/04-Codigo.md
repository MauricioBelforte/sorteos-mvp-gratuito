# Código - Frontend Web

## Archivos Principales

### web/app/page.tsx
**Descripción:** Página home (landing) con el flujo principal de sorteos
**Funciones clave:**
- Hero con título con gradiente y SocialIcons
- Formulario de creación de sorteo (componente SorteoForm)
- Visualización de resultados (componente ResultCard)
- Tabla de precios (componente PriceDisplay)
- Animaciones de entrada (fade-in, scale-in)

**Archivos involucrados:**
- `components/features/SorteoForm.tsx`
- `components/features/ResultCard.tsx`
- `components/features/PriceDisplay.tsx`
- `components/features/SocialIcons.tsx`
- `components/ui/Card.tsx`

### web/app/layout.tsx
**Descripción:** Layout principal con SEO
**Funciones clave:**
- Configurar metadata de Next.js
- Integrar módulo SEO
- Estructura HTML raíz

**Archivos involucrados:**
- `@shared/seo` - Módulo SEO
- `./globals.css` - Estilos globales

**Logs relacionados:** Logs de hidratación, errores de SEO

### web/app/auth/register/page.tsx
**Descripción:** Página de registro
**Funciones clave:**
- Manejo de estado del formulario
- Llamada a register() de API
- Redirección a dashboard

**Archivos involucrados:**
- `lib/api.ts` - Cliente API

**Logs relacionados:** Logs de registro, errores de validación

### web/app/auth/login/page.tsx
**Descripción:** Página de login
**Funciones clave:**
- Manejo de estado del formulario
- Llamada a login() de API
- Redirección a dashboard

**Archivos involucrados:**
- `lib/api.ts` - Cliente API

**Logs relacionados:** Logs de login, errores de autenticación

### web/app/dashboard/page.tsx
**Descripción:** Dashboard de usuario
**Funciones clave:**
- Carga de sorteos del usuario
- Creación de nuevos sorteos
- Logout del usuario

**Archivos involucrados:**
- `lib/api.ts` - Cliente API
- `next/navigation` - Router de Next.js

**Logs relacionados:** Logs de dashboard, errores de carga

### web/app/sorteo/[id]/page.tsx
**Descripción:** Página de detalle de sorteo
**Funciones clave:**
- Carga de sorteo por ID
- Parseo de ganadores y suplentes
- Visualización de hash de verificación

**Archivos involucrados:**
- `lib/api.ts` - Cliente API
- `next/navigation` - Router de Next.js

**Logs relacionados:** Logs de detalle, errores de parseo

### web/lib/api.ts
**Descripción:** Cliente API
**Funciones clave:**
- `fetchAPI()` - Helper para requests autenticados
- `register()` - Registro de usuario
- `login()` - Login de usuario
- `crearSorteo()` - Crear sorteo
- `listarSorteos()` - Listar sorteos
- `obtenerSorteo()` - Obtener sorteo

**Archivos involucrados:**
- Ninguno (dependencias externas)

**Nota:** Se eliminó la propiedad `token` inválida de los objetos RequestInit en `crearSorteo()` y `listarSorteos()` (fetchAPI ya lee el token de localStorage).

**Logs relacionados:** Logs de API, errores de red

## Sistema de Diseño (Design System)

### web/app/globals.css
**Descripción:** Estilos globales con sistema de diseño completo
**Contenido:**
- Directivas Tailwind (`@tailwind base/components/utilities`)
- Variables CSS (colores, tipografía, espaciado, bordes, sombras, transiciones)
- Clases utilitarias (container, card, grid-responsive, fade-in)
- Media queries responsive (móvil < 640px)

### web/tailwind.config.js
**Descripción:** Configuración de Tailwind CSS
**Contenido:**
- Content: `app/**` y `components/**`
- Colores extendidos (primary, secondary, success, warning, error)
- Animaciones custom: `fade-in`, `scale-in`
- `duration-250` para transiciones

### web/postcss.config.js
**Descripción:** Configuración de PostCSS con Tailwind y Autoprefixer

### web/components/ui/ (Componentes base)
| Componente | Descripción |
|------------|-------------|
| `Button.tsx` | Botón con variantes (primary, secondary, outline, ghost), tamaños y loading state |
| `Card.tsx` | Tarjeta con hover effects y padding configurable |
| `Input.tsx` | Input con floating label, estados focus/error y icono |
| `Loader.tsx` | Spinner animado con variantes de tamaño y color |
| `Alert.tsx` | Alert con variantes (success, error, warning, info) e iconos |

### web/components/features/ (Componentes del dominio)
| Componente | Descripción |
|------------|-------------|
| `SocialIcons.tsx` | Iconos SVG de Instagram, TikTok y YouTube con hover effects y accesibilidad |
| `SorteoForm.tsx` | Formulario con detección automática de red social, validación en tiempo real y POST a `/api/sorteos` |
| `PriceDisplay.tsx` | Cards con gradientes por rango de precios y grid responsive |
| `ResultCard.tsx` | Resultados: sorteo completado (ganador, hash, copiar) y requiere pago (precio) |

**Nota:** Los componentes base UI y features usan clases Tailwind. Tailwind CSS v3 fue instalado y configurado el 2026-08-02 (antes los componentes base existían sin Tailwind configurado, por lo que no se renderizaban con estilos).

## Dependencias Principales

### package.json
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@shared/seo": "file:../../shared-modules/seo"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0"
  }
}
```

## Variables de Entorno

### .env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Comandos de Ejecución

### Desarrollo
```bash
npm run dev  # next dev
```

### Build
```bash
npm run build  # next build
```

### Producción
```bash
npm start  # next start
```

## Componentes React

### HomePage
**Estado:**
- resultado: any (respuesta del servidor: sorteo completado o requiere pago)

**Event Handlers:**
- setResultado: callback recibido por SorteoForm vía onResultado

**Componentes:**
- Hero con título gradiente + SocialIcons
- SorteoForm (POST a `/api/sorteos` con urlPublicacion, redSocial, cantidadGanadores, cantidadSuplentes)
- ResultCard (cuando hay resultado, con onReiniciar)
- PriceDisplay

### RegisterPage
**Estado:**
- email: string
- password: string
- nombre: string
- error: string | null
- loading: boolean

**Event Handlers:**
- handleSubmit(e: FormEvent): Procesa formulario

### LoginPage
**Estado:**
- email: string
- password: string
- error: string | null
- loading: boolean

**Event Handlers:**
- handleSubmit(e: FormEvent): Procesa formulario

### DashboardPage
**Estado:**
- sorteos: Sorteo[]
- loading: boolean
- error: string | null
- nuevoSorteo: { titulo, urlPublicacion, redSocial, cantidadGanadores }

**Event Handlers:**
- handleCrearSorteo(): Crea nuevo sorteo
- handleLogout(): Logout del usuario

### SorteoDetailPage
**Estado:**
- sorteo: Sorteo | null
- loading: boolean
- error: string | null

**Event Handlers:**
- Ninguno (solo visualización)

## Estilos

### globals.css
**Descripción:** Estilos globales de la aplicación
**Contenido:**
- Reset CSS
- Estilos base
- Utilidades básicas

**Logs relacionados:** Logs de estilos, errores de CSS

## Rutas Next.js

### Públicas
- `/` - Home (landing page)
- `/auth/register` - Registro
- `/auth/login` - Login

### Protegidas (requieren auth)
- `/dashboard` - Dashboard
- `/sorteo/[id]` - Detalle de sorteo

## Manejo de Errores

### Errores de API
- Mostrar mensaje de error al usuario
- Logs en consola para debugging
- No exponer detalles sensibles

### Errores de Validación
- Validar en cliente antes de enviar
- Mostrar mensajes de error claros
- Prevenir envío de formularios inválidos

### Errores de Red
- Mostrar mensaje de error genérico
- Sugerir recargar la página
- Logs detallados para debugging

## Optimización

### Code Splitting
- Next.js hace code splitting automático
- Cargar solo componentes necesarios

### Imágenes
- Usar next/image para optimización
- Lazy loading de imágenes

### Fonts
- Usar next/font para optimización
- Cargar solo fonts necesarios

## Testing Manual

### Flujo de Registro
1. Acceder a `/auth/register`
2. Ingresar datos válidos
3. Click en "Registrarse"
4. Verificar redirección a dashboard
5. Verificar token en localStorage

### Flujo de Login
1. Acceder a `/auth/login`
2. Ingresar credenciales válidas
3. Click en "Iniciar Sesión"
4. Verificar redirección a dashboard
5. Verificar token en localStorage

### Flujo de Sorteo
1. Acceder a `/dashboard`
2. Ingresar datos de sorteo
3. Click en "Crear Sorteo"
4. Verificar sorteo en lista
5. Acceder a detalle de sorteo
6. Verificar ganadores y hash

### Flujo de Sorteo desde Home (MVP actual)
1. Acceder a `/`
2. Pegar URL de Instagram, TikTok o YouTube
3. Verificar detección automática de red social (badge en el input)
4. Click en "Crear Sorteo" (con loader animado)
5. Si requiere pago: verificar ResultCard amarilla con precio
6. Si es gratis: verificar ResultCard verde con ganador, hash y botón copiar
