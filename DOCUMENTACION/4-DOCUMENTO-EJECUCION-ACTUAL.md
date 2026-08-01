# Documento de Ejecución - MVP Sorteos Gratuitos

## 1. Instrucciones de Ejecución

### 1.1 Requisitos Previos
- Node.js 18+ instalado
- npm o yarn instalado
- Cuenta de Mercado Pago (para pagos)

### 1.2 Configuración Inicial

#### Backend (api/)
```bash
cd api
npm install
cp .env.example .env  # Editar con tus credenciales
npx prisma generate
npx prisma db push
npm run dev
```

#### Frontend (web/)
```bash
cd web
npm install
cp .env.local.example .env.local  # Editar con tu API URL
npm run dev
```

#### Módulos Reutilizables (shared-modules/)
```bash
cd shared-modules/seo
npm install
npm run build

cd ../mercadopago
npm install
npm run build
```

### 1.3 Variables de Entorno

#### Backend (.env)
```env
DATABASE_URL=file:./dev.db
JWT_SECRET=tu-secret-jwt-aqui
APP_BASE_URL=http://localhost:3000
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxx-o-PROD-xxx
MERCADO_PAGO_WEBHOOK_SECRET=tu-secret-webhook
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 1.4 Comandos de Ejecución

#### Backend
```bash
npm run dev      # Desarrollo con hot reload
npm run build    # Compilar TypeScript
npm start        # Ejecutar producción
```

#### Frontend
```bash
npm run dev      # Desarrollo con hot reload
npm run build    # Build para producción
npm start        # Ejecutar producción
```

## 2. Endpoints API

### 2.1 Autenticación
- `POST /api/auth/register` - Registro de usuario
  - Body: `{ email, password, nombre }`
  - Response: `{ token, usuario }`

- `POST /api/auth/login` - Login de usuario
  - Body: `{ email, password }`
  - Response: `{ token, usuario }`

- `GET /api/auth/me` - Obtener usuario actual
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ id, email, nombre, rol, bloqueado }`

### 2.2 Sorteos
- `POST /api/sorteos` - Crear sorteo
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ titulo, urlPublicacion, redSocial, cantidadGanadores, cantidadSuplentes }`
  - Response: `{ sorteo: { id, titulo, estado, ganadores, suplentes, hashVerificacion } }`

- `GET /api/sorteos` - Listar sorteos del usuario
  - Headers: `Authorization: Bearer <token>`
  - Response: `[{ id, titulo, estado, createdAt, certificados }]`

- `GET /api/sorteos/:id` - Obtener sorteo por ID
  - Response: `{ id, titulo, estado, hashVerificacion, certificados }`

### 2.3 Pagos
- `POST /api/pagos/checkout` - Crear pago por sorteo
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ sorteoId }`
  - Response: `{ checkoutUrl, sandboxCheckoutUrl, preferenceId }`

- `POST /api/pagos/webhook` - Webhook de Mercado Pago
  - Body: Notificación de Mercado Pago
  - Response: `{ received: true }`

## 3. Archivos Principales

### 3.1 Backend

#### api/src/index.ts
Entry point del servidor Express.
- Configura middleware (cors, json)
- Registra rutas (auth, sorteos, pagos)
- Inicia servidor en puerto 4000

#### api/src/routes/auth.ts
Rutas de autenticación.
- `POST /register` - Registro con bcrypt
- `POST /login` - Login con JWT
- `GET /me` - Obtener usuario actual

#### api/src/routes/sorteos.ts
Rutas de sorteos.
- `POST /` - Crear sorteo con scraping
- `GET /` - Listar sorteos del usuario
- `GET /:id` - Obtener sorteo por ID

#### api/src/routes/pagos.ts
Rutas de pagos.
- `POST /checkout` - Crear preferencia Mercado Pago
- `POST /webhook` - Recibir notificaciones Mercado Pago

#### api/src/lib/verificacion.ts
Motor de sorteos determinístico.
- `generarHashParticipantes()` - Hash de participantes
- `generarHashVerificacion()` - Hash completo
- `realizarSorteo()` - Selección de ganadores

#### api/src/collectors/
Scraping de redes sociales.
- `instagram.ts` - Scraping de Instagram
- `tiktok.ts` - Scraping de TikTok
- `youtube.ts` - Scraping de YouTube

### 3.2 Frontend

#### web/app/layout.tsx
Layout principal con SEO.
- Configura metadata de Next.js
- Integra módulo SEO

#### web/app/auth/register/page.tsx
Página de registro.
- Formulario de registro
- Llamada a API de registro
- Redirección a dashboard

#### web/app/auth/login/page.tsx
Página de login.
- Formulario de login
- Llamada a API de login
- Redirección a dashboard

#### web/app/dashboard/page.tsx
Dashboard de usuario.
- Lista de sorteos
- Formulario para crear sorteo
- Logout

#### web/app/sorteo/[id]/page.tsx
Página de detalle de sorteo.
- Muestra ganadores y suplentes
- Muestra hash de verificación

#### web/lib/api.ts
Cliente API.
- `fetchAPI()` - Helper para requests autenticados
- `register()` - Registro
- `login()` - Login
- `crearSorteo()` - Crear sorteo
- `listarSorteos()` - Listar sorteos
- `obtenerSorteo()` - Obtener sorteo

### 3.3 Módulos Reutilizables

#### shared-modules/seo/
Módulo de SEO técnico.
- `generateMetadata()` - Meta tags HTML
- `generateSitemap()` - Sitemap XML
- `generateRobotsTxt()` - Robots.txt
- `generateStructuredData()` - JSON-LD

#### shared-modules/mercadopago/
Módulo de Mercado Pago.
- `createUsagePayment()` - Pago por uso
- `createPayment()` - Pago personalizado
- `verifyWebhookSignature()` - Verificación de webhook

## 4. Flujo de Desarrollo

### 4.1 Modificar Backend
1. Editar archivos en `api/src/`
2. TypeScript compila automáticamente con `npm run dev`
3. Probar cambios en http://localhost:4000

### 4.2 Modificar Frontend
1. Editar archivos en `web/app/`
2. Next.js compila automáticamente con `npm run dev`
3. Probar cambios en http://localhost:3000

### 4.3 Modificar Módulos
1. Editar archivos en `shared-modules/*/src/`
2. Ejecutar `npm run build` para compilar
3. Reinstalar en MVP: `npm install` en api/ o web/

## 5. Troubleshooting

### 5.1 Errores Comunes

#### Error: "Cannot find module '@shared/seo'"
**Solución:** Ejecutar `npm install` en web/

#### Error: "Cannot find module '@shared/mercadopago'"
**Solución:** Ejecutar `npm install` en api/

#### Error: "Hydration failed"
**Solución:** Verificar que no se use `dangerouslySetInnerHTML` en `<head>`

#### Error: "Prisma schema validation failed"
**Solución:** Ejecutar `npx prisma db push`

### 5.2 Logs de Errores
- Backend: Consola de terminal donde corre `npm run dev`
- Frontend: Consola de terminal donde corre `npm run dev`
- Browser: DevTools Console

## 6. Testing Manual

### 6.1 Flujo Completo
1. Acceder a http://localhost:3000
2. Registrar usuario en `/auth/register`
3. Login en `/auth/login`
4. Crear sorteo en `/dashboard`
5. Ver resultado en `/sorteo/[id]`

### 6.2 Testing de Pagos
1. Crear sorteo
2. Llamar a `POST /api/pagos/checkout`
3. Redirigir a URL de checkout
4. Completar pago (sandbox)
5. Verificar webhook recibido

### 6.3 Testing de Scraping
1. Crear sorteo con URL de Instagram/TikTok/YouTube
2. Verificar que se recolecten comentarios
3. Verificar que se seleccionen ganadores
4. Verificar hash de verificación

## 7. Deploy en Producción

### 7.1 Supabase (PostgreSQL)
1. Crear proyecto en Supabase
2. Obtener DATABASE_URL
3. Actualizar .env con DATABASE_URL de Supabase
4. Ejecutar `npx prisma db push`

### 7.2 Vercel (Frontend)
1. Conectar repo de GitHub a Vercel
2. Configurar variables de entorno
3. Deploy automático en cada push

### 7.3 Backend (Producción)
1. Deploy en Vercel, Railway, o similar
2. Configurar variables de entorno
3. Configurar webhook URL en Mercado Pago

## 8. Monitoreo

### 8.1 Logs de Aplicación
- Backend: Logs en consola
- Frontend: Logs en consola
- Errores: Capturar y documentar en Logs/

### 8.2 Métricas
- Tiempo de respuesta de API
- Tasa de éxito de scraping
- Tasa de conversión de pagos
- Errores de autenticación

## 9. Mantenimiento

### 9.1 Actualización de Dependencias
```bash
cd api
npm update

cd ../web
npm update

cd ../shared-modules/seo
npm update

cd ../mercadopago
npm update
```

### 9.2 Rotación de Logs
- Logs se rotan automáticamente al exceder tamaño máximo
- Logs rotados se guardan en `Logs/rotated/`
- Formato: `NN-nombre-YYYY-MM-DD.log`

### 9.3 Actualización de Documentación
- Actualizar DOCUMENTACION/*-ACTUAL.md con cambios
- Crear logs en Logs/ con cada cambio
- Actualizar plan-actual/ de componentes modificados
