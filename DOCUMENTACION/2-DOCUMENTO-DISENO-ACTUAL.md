# Documento de Diseño - Sorteosypromos

## 1. Arquitectura General

### 1.1 Arquitectura de Alto Nivel

```
┌──────────────────────────────────────────────────────────────┐
│                    Vercel — Web (Frontend)                    │
│  Next.js 14 — sorteos-mvp-gratuito-nine.vercel.app           │
│  Solo presentación: HTML/CSS/JS + ruleta + llamadas fetch     │
└───────────────────────────┬──────────────────────────────────┘
                            │ HTTPS /api/* (CORS restringido)
                            ▼
┌──────────────────────────────────────────────────────────────┐
│             Render — API + Scraper (Backend)                  │
│  Express + Playwright — sorteos-api-y0dp.onrender.com         │
│  Abre Chrome real (Xvfb) para scraping (Estrategia G,         │
│  scroll anónimo completo de Instagram)                        │
└───────────────────────────┬──────────────────────────────────┘
                            │ Prisma (PostgreSQL)
                            ▼
┌──────────────────────────────────────────────────────────────┐
│               Supabase — PostgreSQL (Datos)                   │
│  pooler: aws-0-sa-east-1.pooler.supabase.com                  │
│  Sorteos, participantes, cuota Apify, cola, pagos, capturas   │
└──────────────────────────────────────────────────────────────┘
```

**Monorepo npm workspaces** (raíz del repo): `api/` + `web/` + `shared-modules/*` (seo, mercadopago) — Vercel instala desde la raíz y resuelve `@shared/seo`.

**Flujo de un sorteo (producción):**

```
Usuario (navegador)
  │
  ▼
Vercel (web) — pega la URL, configura ganadores, sortea
  │  GET/POST https://sorteos-api-y0dp.onrender.com/api/...
  ▼
Render (API)
  ├─ Scrapea la publicación (IG/YouTube/TikTok)
  │    ├─ Estrategia G: Chrome real + Xvfb + scroll anónimo
  │    └─ Respaldo: GraphQL, DOM, Apify, ScrapFly
  ├─ Guarda sorteo + participantes en Supabase
  └─ Responde ganadores determinísticos + hash de verificación
  ▲
  │
Vercel muestra la ruleta animada y el resultado
```

**Roles:** Supabase = memoria (guarda datos) · Vercel = vidriera (muestra) · Render = manos (trabajo pesado: scraping con Chrome).

### 1.2 Arquitectura de Módulos Reutilizables

```
shared-modules/
├── seo/                    ← Módulo SEO Técnico
│   ├── src/
│   │   ├── metadata.ts     ← Meta tags
│   │   ├── sitemap.ts      ← Sitemap XML
│   │   ├── robots.ts       ← Robots.txt
│   │   ├── structured-data.ts ← JSON-LD
│   │   └── types.ts
│   └── dist/
└── mercadopago/            ← Módulo Mercado Pago
    ├── src/
    │   ├── client.ts       ← Cliente API
    │   ├── payment.ts      ← Funciones de pago
    │   └── types.ts
    └── dist/
```

## 2. Diseño de Componentes

### 2.1 Backend API

#### Estructura de Carpetas
```
api/
├── src/
│   ├── routes/
│   │   ├── auth.ts         ← Rutas de autenticación
│   │   ├── sorteos.ts      ← Rutas de sorteos
│   │   └── pagos.ts        ← Rutas de pagos
│   ├── lib/
│   │   ├── auth.ts         ← Funciones de auth (JWT, bcrypt)
│   │   ├── middleware.ts   ← Middleware de autenticación
│   │   ├── prisma.ts       ← Cliente Prisma
│   │   └── verificacion.ts ← Motor de sorteos
│   └── collectors/
│       ├── index.ts        ← Exportador de collectors
│       ├── instagram.ts    ← Scraping Instagram
│       ├── tiktok.ts       ← Scraping TikTok
│       └── youtube.ts      ← Scraping YouTube
├── prisma/
│   └── schema.prisma       ← Esquema de base de datos
└── index.ts                ← Entry point
```

#### Rutas API
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login de usuario
- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/sorteos` - Crear sorteo (requiere auth)
- `GET /api/sorteos` - Listar sorteos del usuario (requiere auth)
- `GET /api/sorteos/:id` - Obtener sorteo por ID
- `POST /api/pagos/pase` - Crear preferencia de pago del Pase Rápido
- `GET /api/pagos/pase/:id` - Estado del Pase Rápido
- `POST /api/pagos/webhook` - Webhook de Mercado Pago
- `POST /api/pagos/verificar` - Verificar pago en el retorno del checkout

### 2.2 Frontend Web

#### Estructura de Carpetas
```
web/
├── app/
│   ├── layout.tsx          ← Layout principal con SEO
│   ├── page.tsx            ← Página home
│   ├── auth/
│   │   ├── register/
│   │   │   └── page.tsx    ← Página de registro
│   │   └── login/
│   │       └── page.tsx    ← Página de login
│   ├── dashboard/
│   │   └── page.tsx        ← Dashboard de usuario
│   └── sorteo/
│       └── [id]/
│           └── page.tsx    ← Página de detalle de sorteo
├── lib/
│   └── api.ts              ← Cliente API
└── .env.local              ← Variables de entorno
```

#### Páginas
- `/` - Home (landing page)
- `/auth/register` - Registro
- `/auth/login` - Login
- `/dashboard` - Dashboard (requiere auth)
- `/sorteo/[id]` - Detalle de sorteo

### 2.3 Base de Datos (Prisma Schema)

#### Modelo de Datos
```prisma
model Usuario {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  nombre    String?
  rol       String   @default("usuario")
  bloqueado Boolean  @default(false)
  createdAt DateTime @default(now())
  sorteos   Sorteo[]
}

model Sorteo {
  id                String          @id @default(uuid())
  titulo            String
  urlPublicacion    String
  redSocial         String
  cantidadGanadores Int
  cantidadSuplentes Int
  estado            String          @default("pendiente")
  hashVerificacion  String?
  timestamp         String?
  participantesHash String?
  usuarioId         String
  usuario           Usuario         @relation(fields: [usuarioId], references: [id])
  participantes     Participante[]
  certificados      Certificado[]
  createdAt         DateTime        @default(now())
}

model Participante {
  id             String  @id @default(uuid())
  usuarioExterno String
  sorteoId       String
  sorteo         Sorteo  @relation(fields: [sorteoId], references: [id])
}

model Certificado {
  id         String   @id @default(uuid())
  ganadores  String
  suplentes  String
  sorteoId   String
  sorteo     Sorteo   @relation(fields: [sorteoId], references: [id])
}
```

## 3. Flujos de Usuario

### 3.1 Flujo de Registro
1. Usuario accede a `/auth/register`
2. Ingresa email, contraseña, nombre
3. Frontend envía POST a `/api/auth/register`
4. Backend valida datos
5. Backend hashea contraseña con bcrypt
6. Backend crea usuario en DB
7. Backend genera token JWT
8. Frontend guarda token en localStorage
9. Frontend redirige a `/dashboard`

### 3.2 Flujo de Creación de Sorteo
1. Usuario accede a `/dashboard`
2. Ingresa título, URL de publicación, red social
3. Frontend envía POST a `/api/sorteos`
4. Backend valida límite mensual (3 sorteos)
5. Backend crea sorteo en estado "pendiente"
6. Backend ejecuta scraping según red social
7. Backend guarda participantes
8. Backend ejecuta motor de sorteos determinístico
9. Backend genera hash de verificación
10. Backend actualiza sorteo a "completado"
11. Backend crea certificado con ganadores
12. Frontend muestra resultado

### 3.3 Flujo de Pago del Pase Rápido (MercadoPago)
1. Se agota la cuota gratuita de la nube → `POST /api/sorteos` responde 402 `{ requierePago: true, motivo: 'cuota', precio, mensaje }`
2. El wizard ofrece Pase Rápido ($2500 ARS) o entrar en la cola de espera gratuita
3. Frontend envía POST a `/api/pagos/pase` → backend crea un `PagoPase` (estado `pendiente`) y una preferencia en Mercado Pago
4. Backend retorna `initPoint` → el frontend guarda el contexto del sorteo en localStorage y redirige al checkout de MP
5. Usuario completa el pago → MP redirige a `WEB_APP_URL/pago?estado=...&paseId=...`
6. La página `/pago` llama `POST /api/pagos/verificar` (consulta el payment por id en MP; fuente de verdad) o el webhook `POST /api/pagos/webhook` aprueba el pase en paralelo
7. Pase `aprobado` → `/pago` guarda el paseId en localStorage y vuelve a la home
8. El wizard restaura el contexto, re-analiza con `paseId + paseAprobado: true` (sin gastar cuota) y el sorteo al crearse **consume** el pase (`usadoEnSorteoId`)
9. Reutilizar un pase consumido → 402 `{ requierePago: true, motivo: 'pase_invalido', mensaje }`

## 4. Diseño de Seguridad

### 4.1 Autenticación
- JWT tokens con expiración de 24 horas
- Contraseñas hasheadas con bcrypt (salt rounds: 10)
- Middleware de autenticación en rutas protegidas

### 4.2 Validación de Webhooks
- Verificación de firma HMAC-SHA256
- Secret de webhook en variables de entorno
- Rechazo de webhooks sin firma válida

### 4.3 Rate Limiting
- Límite de 3 sorteos por mes por usuario
- Validación en backend antes de crear sorteo

## 5. Diseño de SEO

### 5.1 Meta Tags
- Título optimizado para Latinoamérica
- Descripción con keywords relevantes
- Open Graph para redes sociales
- Twitter Cards
- Canonical URL

### 5.2 Structured Data
- Organization data para Schema.org
- SoftwareApplication data
- Product data para sorteos

### 5.3 Multi-idioma
- Soporte para locales: es-AR, es-MX, es-CO, es-CL, es-PE, es-ES
- Meta tags alternos por locale

## 6. Diseño de Scraping

### 6.1 Estrategia de Scraping
- Playwright para navegación headless
- Extracción de comentarios del DOM
- Manejo de lazy loading
- Timeout de 30 segundos

### 6.2 Redes Soportadas
- **Instagram:** Extracción de comentarios de posts
- **TikTok:** Extracción de comentarios de videos
- **YouTube:** Extracción de comentarios de videos

## 7. Diseño de Motor de Sorteos

### 7.1 Algoritmo Determinístico
- PRNG basado en semilla (hash de participantes + timestamp)
- Selección sin repetición
- Generación de hash de verificación
- Certificado con ganadores y suplentes

### 7.2 Verificación
- Hash SHA-256 de participantes ordenados
- Hash SHA-256 de (participantesHash + timestamp)
- Permite verificación externa del resultado

## 8. Diseño de Pagos

### 8.1 Integración Mercado Pago
- Preferencia de pago por sorteo
- Precio fijo: 100 ARS
- Webhook para notificaciones
- URLs de retorno (success, failure, pending)

### 8.2 Flujo de Pago
- Creación de preferencia
- Redirección a checkout
- Recepción de webhook
- Verificación de firma
- Actualización de estado

## 9. Diseño de Logs

### 9.1 Sistema de Logs
- Carpeta `Logs/` en raíz
- Numeración secuencial con `ULTIMO_NUMERO.txt`
- Formato: `NN-DESCRIPCION_BREVE_AAAA-MM-DD_HH-MM-SS.md`
- Rotación automática cuando excede tamaño máximo

### 9.2 Contenido de Logs
- Código original
- Código nuevo
- Descripción breve de la modificación
- Referencia a archivos modificados

## 10. Diseño de Documentación

### 10.1 Estructura de Documentación
- DOCUMENTACION/ con 4 archivos principales
- Plan Inicial/ con documentación original
- Componentes numerados con plan-inicial/ y plan-actual/
- Cada componente con 7 archivos obligatorios

### 10.2 Actualización de Documentación
- plan-inicial/: NO MODIFICAR
- plan-actual/: ACTUALIZAR con cambios
- Logs/: Registrar cada cambio
- DOCUMENTACION/*-ACTUAL.md: Actualizar con cambios significativos
