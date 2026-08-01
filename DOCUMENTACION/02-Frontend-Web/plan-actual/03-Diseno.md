# Diseño - Frontend Web

## Arquitectura

### Arquitectura de Componentes
```
┌─────────────────────────────────┐
│         Layout Principal         │
│  (SEO, Metadata, Navigation)    │
└──────────────┬──────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
┌───▼────┐ ┌──▼────┐ ┌───▼────┐
│ Auth   │ │Dashboard│ │ Sorteo │
│ Pages  │ │  Page   │ │ Detail │
└────────┘ └────────┘ └────────┘
```

### Diagrama de Flujo - Registro
```
Usuario → /auth/register
    ↓
Ingresa email, password, nombre
    ↓
Click en "Registrarse"
    ↓
Llama a register() de API
    ↓
API retorna token y usuario
    ↓
Guarda token en localStorage
    ↓
Guarda usuario en localStorage
    ↓
Redirige a /dashboard
```

### Diagrama de Flujo - Login
```
Usuario → /auth/login
    ↓
Ingresa email, password
    ↓
Click en "Iniciar Sesión"
    ↓
Llama a login() de API
    ↓
API retorna token y usuario
    ↓
Guarda token en localStorage
    ↓
Guarda usuario en localStorage
    ↓
Redirige a /dashboard
```

### Diagrama de Flujo - Crear Sorteo
```
Usuario → /dashboard
    ↓
Ingresa título, URL, red social
    ↓
Click en "Crear Sorteo"
    ↓
Llama a crearSorteo() de API
    ↓
API retorna sorteo con ganadores
    ↓
Muestra resultado en dashboard
    ↓
Actualiza lista de sorteos
```

## Páginas

### Layout Principal (app/layout.tsx)
**Descripción:** Layout raíz de la aplicación
**Funciones:**
- Configurar metadata de Next.js
- Integrar módulo SEO
- Envolver páginas con estructura HTML

**Componentes:**
- `<html>` con lang="es"
- `<head>` con metadata
- `<body>` con children

### Página de Registro (app/auth/register/page.tsx)
**Descripción:** Formulario de registro de usuario
**Estado:**
- email: string
- password: string
- nombre: string
- error: string | null
- loading: boolean

**Funciones:**
- handleSubmit(): Llama a register() de API
- Redirige a /dashboard si exitoso

**Validaciones:**
- Email requerido
- Password requerido (mínimo 6 caracteres)
- Nombre opcional

### Página de Login (app/auth/login/page.tsx)
**Descripción:** Formulario de login de usuario
**Estado:**
- email: string
- password: string
- error: string | null
- loading: boolean

**Funciones:**
- handleSubmit(): Llama a login() de API
- Redirige a /dashboard si exitoso

**Validaciones:**
- Email requerido
- Password requerido

### Dashboard (app/dashboard/page.tsx)
**Descripción:** Dashboard de usuario con lista de sorteos
**Estado:**
- sorteos: Sorteo[]
- loading: boolean
- error: string | null
- nuevoSorteo: { titulo, urlPublicacion, redSocial, cantidadGanadores }

**Funciones:**
- useEffect(): Carga sorteos del usuario
- handleCrearSorteo(): Crea nuevo sorteo
- handleLogout(): Limpia localStorage y redirige

**Componentes:**
- Formulario para crear sorteo
- Lista de sorteos existentes
- Botón de logout

### Página de Detalle de Sorteo (app/sorteo/[id]/page.tsx)
**Descripción:** Página de detalle de un sorteo específico
**Estado:**
- sorteo: Sorteo | null
- loading: boolean
- error: string | null

**Funciones:**
- useEffect(): Carga sorteo por ID
- parseGanadores(): Parsea JSON de ganadores
- parseSuplentes(): Parsea JSON de suplentes

**Componentes:**
- Información del sorteo
- Lista de ganadores
- Lista de suplentes
- Hash de verificación
- Botón para volver al dashboard

## Cliente API (lib/api.ts)

### Funciones

#### fetchAPI()
**Descripción:** Helper para requests autenticados
**Parámetros:**
- endpoint: string
- options?: RequestInit

**Lógica:**
- Obtiene token de localStorage
- Agrega header Authorization
- Maneja errores de autenticación
- Redirige a login si token expira

#### register()
**Descripción:** Registro de usuario
**Parámetros:**
- email: string
- password: string
- nombre: string

**Retorna:** { token: string, usuario: Usuario }

#### login()
**Descripción:** Login de usuario
**Parámetros:**
- email: string
- password: string

**Retorna:** { token: string, usuario: Usuario }

#### crearSorteo()
**Descripción:** Crear sorteo
**Parámetros:**
- titulo: string
- urlPublicacion: string
- redSocial: string
- cantidadGanadores: number
- cantidadSuplentes?: number

**Retorna:** Sorteo con ganadores

#### listarSorteos()
**Descripción:** Listar sorteos del usuario
**Retorna:** Sorteo[]

#### obtenerSorteo()
**Descripción:** Obtener sorteo por ID
**Parámetros:**
- id: string

**Retorna:** Sorteo

## SEO

### Integración de Módulo SEO
- Importar funciones de @shared/seo
- Usar metadata nativo de Next.js
- Configurar Open Graph
- Configurar Twitter Cards
- Soporte multi-idioma (es-AR, es-MX, es-CO, es-CL, es-PE, es-ES)

### Meta Tags
```typescript
export const metadata = {
  title: 'Sorteos MVP Gratuito - Sistema de Sorteos Online',
  description: 'Realiza sorteos gratuitos en Instagram, TikTok y YouTube...',
  keywords: ['sorteos', 'instagram', 'tiktok', 'youtube', 'gratuito'],
  openGraph: {
    title: 'Sorteos MVP Gratuito',
    description: '...',
    type: 'website',
    locale: 'es_AR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sorteos MVP Gratuito',
    description: '...',
  },
}
```

## Manejo de Estado

### LocalStorage
- **token:** JWT token de autenticación
- **usuario:** Datos del usuario actual

### Estado de Componentes
- **loading:** Boolean para mostrar loading
- **error:** String para mostrar errores
- **data:** Datos específicos del componente

## Responsive Design
- Mobile-first approach
- CSS media queries para breakpoints
- Flexbox y Grid para layouts
- Test en diferentes tamaños de pantalla
