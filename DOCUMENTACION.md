# Documentación MVP Gratuito

## Resumen

Versión simplificada y gratuita del sistema de sorteos para MVP inicial. No requiere pagos de APIs ni servicios de pago.

## Características

### Redes Sociales
- **Instagram**: Scraping con Playwright (sin API oficial)
- **TikTok**: Scraping con Playwright (sin API oficial)  
- **YouTube**: Scraping con Playwright (sin API oficial)
- **Eliminado**: Twitter/X (API es pago obligatorio)
- **Eliminado**: Facebook (API requiere aprobación)

### Planes
- **Solo plan free**: 3 sorteos por mes por usuario
- **Eliminado**: Mercado Pago (solo plan free)
- **Eliminado**: Planes starter/pro/anual

### Infraestructura (100% gratuita)
- Frontend: Next.js en Vercel (gratis)
- Backend: Express en Vercel (gratis)
- Base de datos: PostgreSQL en Supabase (gratis hasta 500MB)
- Cola: Redis en Upstash (gratis hasta 10k comandos/mes)

## Estructura del Proyecto

```
sorteos-mvp-gratuito/
├── api/                    # Backend Express
│   ├── prisma/
│   │   └── schema.prisma   # Schema simplificado
│   ├── src/
│   │   ├── collectors/     # Scraping Instagram/TikTok/YouTube
│   │   ├── lib/           # Prisma, auth, middleware, verificación
│   │   ├── routes/        # auth, sorteos
│   │   └── index.ts       # Servidor Express
│   ├── package.json
│   └── tsconfig.json
├── web/                    # Frontend Next.js
│   ├── app/
│   │   ├── auth/          # Login/Register
│   │   ├── dashboard/     # Crear y listar sorteos
│   │   ├── sorteo/[id]/   # Detalle de sorteo
│   │   ├── layout.tsx
│   │   ├── page.tsx       # Home
│   │   └── globals.css
│   ├── lib/
│   │   └── api.ts         # Cliente API
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Instalación

### 1. Instalar dependencias del backend
```bash
cd api
npm install
```

### 2. Instalar dependencias del frontend
```bash
cd web
npm install
```

### 3. Configurar variables de entorno

**Backend (api/.env):**
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
REDIS_URL=redis://host:6379
JWT_SECRET=tu-secret-jwt-aqui
APP_BASE_URL=http://localhost:3000
```

**Frontend (web/.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 4. Configurar base de datos
```bash
cd api
npx prisma generate
npx prisma db push
```

## Ejecución Local

### Backend
```bash
cd api
npm run dev
```
API corre en http://localhost:4000

### Frontend
```bash
cd web
npm run dev
```
Frontend corre en http://localhost:3000

## Despliegue Gratuito

### 1. Supabase (Base de datos)
1. Crear cuenta gratuita en https://supabase.com
2. Crear nuevo proyecto
3. Copiar connection string
4. Configurar en `api/.env`

### 2. Upstash (Redis)
1. Crear cuenta gratuita en https://upstash.com
2. Crear nuevo database Redis
3. Copiar connection string
4. Configurar en `api/.env`

### 3. Vercel (Frontend)
1. Instalar Vercel CLI: `npm i -g vercel`
2. Desplegar frontend:
```bash
cd web
vercel
```

### 4. Vercel (Backend)
1. Desplegar backend:
```bash
cd api
vercel
```

## Límites de Servicios Gratuitos

### Supabase
- 500MB de almacenamiento (~10k sorteos)
- 500MB de bandwidth mensual
- 2 conexiones simultáneas

### Upstash
- 10k comandos Redis/mes (~500 sorteos/mes)
- 256MB de memoria

### Vercel
- 100GB bandwidth/mes
- 6GB de RAM
- 1000ms timeout (puede ser problema para Playwright)

## Limitaciones del MVP

1. **Playwright en Vercel**: Puede ser lento o fallar por límites de tiempo
2. **Scraping**: Puede fallar si las redes sociales cambian su HTML
3. **Sin pagos**: Solo plan free, sin monetización
4. **Sin panel admin**: Solo usuarios normales
5. **Sin exportaciones**: No hay PDF/CSV

## Próximos Pasos

1. Instalar dependencias: `npm install` en api/ y web/
2. Crear cuenta en Supabase y configurar DATABASE_URL
3. Crear cuenta en Upstash y configurar REDIS_URL
4. Ejecutar migraciones: `npx prisma db push`
5. Probar localmente: `npm run dev` en api/ y web/
6. Desplegar en Vercel

## Diferencias con Versión Completa

| Característica | MVP Gratuito | Versión Completa |
|--------------|--------------|------------------|
| Instagram | Scraping | API oficial |
| TikTok | Scraping | Scraping |
| YouTube | Scraping | API oficial |
| Twitter | ❌ Eliminado | API oficial |
| Facebook | ❌ Eliminado | API oficial |
| Planes | Solo free | Free/Starter/Pro |
| Pagos | ❌ Eliminado | Mercado Pago |
| Panel admin | ❌ Eliminado | Completo |
| Exportaciones | ❌ Eliminado | PDF/CSV/Imagen |
| Cola | ❌ Eliminado | BullMQ + Redis |
| Worker | ❌ Eliminado | Separado |

## Archivos Principales

### Backend
- `api/src/index.ts`: Servidor Express
- `api/src/routes/auth.ts`: Rutas de autenticación
- `api/src/routes/sorteos.ts`: Rutas de sorteos
- `api/src/collectors/`: Scraping de redes sociales
- `api/src/lib/verificacion.ts`: Motor de sorteo determinístico
- `api/prisma/schema.prisma`: Schema de base de datos

### Frontend
- `web/app/page.tsx`: Página principal
- `web/app/auth/register/page.tsx`: Registro
- `web/app/auth/login/page.tsx`: Login
- `web/app/dashboard/page.tsx`: Dashboard
- `web/app/sorteo/[id]/page.tsx`: Detalle de sorteo
- `web/lib/api.ts`: Cliente API
