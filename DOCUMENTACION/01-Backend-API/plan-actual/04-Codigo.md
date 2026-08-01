# Código - Backend API

## Archivos Principales

### api/src/index.ts
**Descripción:** Entry point del servidor Express
**Funciones clave:**
- Configura middleware (cors, json)
- Registra rutas (auth, sorteos, pagos)
- Inicia servidor en puerto 4000

**Logs relacionados:** Logs de inicio del servidor

### api/src/routes/auth.ts
**Descripción:** Rutas de autenticación
**Funciones clave:**
- `POST /register` - Registro con bcrypt
- `POST /login` - Login con JWT
- `GET /me` - Obtener usuario actual

**Archivos involucrados:**
- `api/src/lib/auth.ts` - Funciones de auth
- `api/src/lib/middleware.ts` - Middleware de autenticación
- `api/src/lib/prisma.ts` - Cliente Prisma

**Logs relacionados:** Logs de autenticación, errores de login/registro

### api/src/routes/sorteos.ts
**Descripción:** Rutas de sorteos
**Funciones clave:**
- `POST /` - Crear sorteo con scraping
- `GET /` - Listar sorteos del usuario
- `GET /:id` - Obtener sorteo por ID

**Archivos involucrados:**
- `api/src/lib/verificacion.ts` - Motor de sorteos
- `api/src/collectors/index.ts` - Exportador de collectors
- `api/src/lib/prisma.ts` - Cliente Prisma

**Logs relacionados:** Logs de creación de sorteos, scraping, errores

### api/src/routes/pagos.ts
**Descripción:** Rutas de pagos
**Funciones clave:**
- `POST /checkout` - Crear preferencia Mercado Pago
- `POST /webhook` - Recibir notificaciones Mercado Pago

**Archivos involucrados:**
- `@shared/mercadopago` - Módulo de pagos
- `api/src/lib/prisma.ts` - Cliente Prisma

**Logs relacionados:** Logs de pagos, webhooks, errores

### api/src/lib/auth.ts
**Descripción:** Funciones de autenticación
**Funciones clave:**
- `generateToken()` - Generar JWT
- `hashPassword()` - Hashear contraseña con bcrypt
- `comparePassword()` - Comparar contraseña

**Archivos involucrados:**
- Ninguno (dependencias externas)

**Logs relacionados:** Logs de generación de tokens, hashing

### api/src/lib/middleware.ts
**Descripción:** Middleware de autenticación
**Funciones clave:**
- `authMiddleware()` - Verificar JWT en headers

**Archivos involucrados:**
- `api/src/lib/auth.ts` - Funciones de auth

**Logs relacionados:** Logs de verificación de tokens, errores de auth

### api/src/lib/verificacion.ts
**Descripción:** Motor de sorteos determinístico
**Funciones clave:**
- `generarHashParticipantes()` - Hash SHA-256 de participantes
- `generarHashVerificacion()` - Hash completo
- `realizarSorteo()` - Selección de ganadores

**Archivos involucrados:**
- Ninguno (dependencias nativas de Node.js)

**Logs relacionados:** Logs de generación de hashes, selección de ganadores

### api/src/collectors/instagram.ts
**Descripción:** Scraping de Instagram
**Funciones clave:**
- `recolectarInstagram()` - Recolectar comentarios de Instagram
- `validarUrlInstagram()` - Validar URL de Instagram

**Archivos involucrados:**
- Playwright (dependencia externa)

**Logs relacionados:** Logs de scraping, errores de navegación

### api/src/collectors/tiktok.ts
**Descripción:** Scraping de TikTok
**Funciones clave:**
- `recolectarTikTok()` - Recolectar comentarios de TikTok
- `validarUrlTikTok()` - Validar URL de TikTok

**Archivos involucrados:**
- Playwright (dependencia externa)

**Logs relacionados:** Logs de scraping, errores de navegación

### api/src/collectors/youtube.ts
**Descripción:** Scraping de YouTube
**Funciones clave:**
- `recolectarYouTube()` - Recolectar comentarios de YouTube
- `validarUrlYouTube()` - Validar URL de YouTube

**Archivos involucrados:**
- Playwright (dependencia externa)

**Logs relacionados:** Logs de scraping, errores de navegación

### api/src/collectors/index.ts
**Descripción:** Exportador de collectors
**Funciones clave:**
- `recolectarComentarios()` - Router según red social

**Archivos involucrados:**
- `instagram.ts`, `tiktok.ts`, `youtube.ts`

**Logs relacionados:** Logs de routing de scraping

### api/prisma/schema.prisma
**Descripción:** Esquema de base de datos
**Modelos:**
- Usuario
- Sorteo
- Participante
- Certificado

**Archivos involucrados:**
- Ninguno (archivo Prisma)

**Logs relacionados:** Logs de migraciones, cambios de schema

## Dependencias Principales

### package.json
```json
{
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "@shared/mercadopago": "file:../../shared-modules/mercadopago",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "mercadopago": "^2.0.0",
    "playwright": "^1.40.0"
  }
}
```

## Variables de Entorno

### .env
```env
DATABASE_URL=file:./dev.db
JWT_SECRET=secret-dev-123456789
APP_BASE_URL=http://localhost:3000
MERCADO_PAGO_ACCESS_TOKEN=TEST-1234567890
MERCADO_PAGO_WEBHOOK_SECRET=webhook-secret-dev
```

## Comandos de Ejecución

### Desarrollo
```bash
npm run dev  # tsx watch src/index.ts
```

### Build
```bash
npm run build  # tsc
```

### Producción
```bash
npm start  # node dist/index.js
```

### Prisma
```bash
npx prisma generate  # Generar cliente
npx prisma db push   # Aplicar schema
```
