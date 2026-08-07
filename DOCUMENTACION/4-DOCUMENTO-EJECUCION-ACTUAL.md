# Documento de Ejecución - Sorteosypromos

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
JWT_SECRET=tu-secret-jwt-aqui  # Para implementación futura de auth
APP_BASE_URL=http://localhost:3000
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxx-o-PROD-xxx  # Token real desde developers.mercadopago.com (placeholder devuelve 401/403)
MERCADO_PAGO_WEBHOOK_SECRET=tu-secret-webhook  # Para implementación futura de pagos
WEB_APP_URL=http://localhost:3000              # Usada en los back_urls del checkout del Pase Rápido
APIFY_CUOTA_MENSUAL=45                          # Límite mensual de sorteos gratis en la nube (0 = sin límite local)
PRECIO_PASE_COLA=2500                           # Precio del Pase Rápido (ARS)
APIFY_TOKEN=                                    # Token del actor Apify (estrategia D, opcional)
SCRAPFLY_TOKEN=                                 # Token de ScrapFly (estrategia F, opcional)
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

### 2.1 Autenticación (IMPLEMENTACIÓN FUTURA)
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
- `POST /api/sorteos` - Crear sorteo (SIN AUTENTICACIÓN)
  - Body: `{ urlPublicacion, redSocial, cantidadGanadores, cantidadSuplentes }`
  - Response (gratis): `{ sorteo: { id, titulo, estado, ganadores, suplentes, hashVerificacion } }`
  - Response (con costo): `{ requierePago: true, cantidadComentarios, precio, moneda, mensaje }`

- `GET /api/sorteos` - Listar sorteos recientes (últimos 50, SIN AUTENTICACIÓN)
  - Response: `[{ id, titulo, estado, createdAt, certificados }]`

- `GET /api/sorteos/:id` - Obtener sorteo por ID (SIN AUTENTICACIÓN)
  - Response: `{ id, titulo, estado, hashVerificacion, certificados }`

### 2.3 Pagos (Pase Rápido — MercadoPago)
- `POST /api/pagos/pase` - Crea la preferencia de pago del Pase Rápido (SIN AUTENTICACIÓN)
  - Body: `{}`
  - Response: `{ paseId, monto, moneda: 'ARS', initPoint, sandboxInitPoint }`
  - Los `back_urls` apuntan a `${WEB_APP_URL}/pago?estado=<success|failure|pending>&paseId=<id>`

- `GET /api/pagos/pase/:id` - Estado del Pase Rápido
  - Response: `{ paseId, estado: 'pendiente'|'aprobado'|'rechazado', monto, moneda, usadoEnSorteoId, pagadoAt }`

- `POST /api/pagos/webhook` - Webhook de Mercado Pago (disparador; la fuente de verdad es la API de MP por payment_id)
  - Body: Notificación de Mercado Pago
  - Response: `{ received: true }`

- `POST /api/pagos/verificar` - Verificación manual usada en el retorno del checkout
  - Body: `{ paseId, paymentId }`
  - Consulta MP por payment_id; si está `approved` y `external_reference === paseId`, aprueba el pase
  - Response: `{ paseId, estado, monto, pagoMpStatus }`

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
Rutas de pagos del Pase Rápido.
- `POST /pase` - Crear preferencia Mercado Pago (`createPayment` de `@shared/mercadopago`)
- `GET /pase/:id` - Estado del Pase
- `POST /webhook` - Recibir notificaciones Mercado Pago y consultar el payment
- `POST /verificar` - Verificar pago en el retorno del checkout

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

> **Estado (Log 40):** API ya desplegada y LIVE en Render: `https://sorteos-api-y0dp.onrender.com`. La web aún se despliega en Vercel (próximo paso).

### 7.1 Supabase (PostgreSQL) ✅
1. Crear proyecto en Supabase
2. Obtener DATABASE_URL — **usar el pooler**: `postgresql://postgres.<REF>@aws-0-sa-east-1.pooler.supabase.com:5432/postgres` (el host directo `db.<ref>.supabase.co` no resuelve IPv4 y falla desde Render)
3. Actualizar .env con DATABASE_URL de Supabase
4. Ejecutar `npx prisma db push` o `prisma migrate deploy`

### 7.2 Vercel (Frontend)
1. Conectar repo de GitHub a Vercel
2. Configurar variables de entorno (`NEXT_PUBLIC_API_URL=https://sorteos-api-y0dp.onrender.com`)
3. Deploy automático en cada push

### 7.3 Backend (Producción) ✅ Render
1. Deploy en Render (Dockerfile propio: Chrome + Xvfb `:99` + `node` en primer plano con `DISPLAY=:99`)
2. Configurar variables de entorno (10: DATABASE_URL pooler, JWT_SECRET, MP tokens, APIFY, cuota, pase, WEB_APP_URL, API_BASE_URL, RATE_LIMIT)
3. Configurar webhook URL en Mercado Pago (`API_BASE_URL/api/pagos/webhook`)
4. Redeploy vía API REST: `POST /v1/services/{id}/deploys` con `{"clearCache":"do_not_clear"}`

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
