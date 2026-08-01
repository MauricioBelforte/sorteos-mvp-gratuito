# Código - Frontend Web

## Archivos Principales

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

**Logs relacionados:** Logs de API, errores de red

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
    "typescript": "^5.0.0"
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
