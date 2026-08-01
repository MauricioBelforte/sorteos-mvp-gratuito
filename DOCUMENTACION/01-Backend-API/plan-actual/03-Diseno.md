# Diseño - Backend API

## Arquitectura

### Arquitectura en Capas
```
┌─────────────────────────────────┐
│      Capa de Rutas (HTTP)       │
│  auth.ts, sorteos.ts, pagos.ts  │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│      Capa de Lógica (Lib)       │
│  auth.ts, verificacion.ts       │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│      Capa de Datos (Prisma)      │
│  Usuario, Sorteo, Participante   │
└─────────────────────────────────┘
```

### Diagrama de Flujo - Creación de Sorteo
```
Usuario → POST /api/sorteos
    ↓
Middleware Auth (verifica JWT)
    ↓
Validar límite mensual (3 sorteos)
    ↓
Crear sorteo en estado "pendiente"
    ↓
Ejecutar scraping según red social
    ↓
Guardar participantes en DB
    ↓
Ejecutar motor de sorteos
    ↓
Generar hash de verificación
    ↓
Actualizar sorteo a "completado"
    ↓
Crear certificado con ganadores
    ↓
Retornar resultado al usuario
```

## Esquema de Base de Datos

### Modelo Usuario
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
```

### Modelo Sorteo
```prisma
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
  usuario           Usuario         @relation(...)
  participantes     Participante[]
  certificados      Certificado[]
  createdAt         DateTime        @default(now())
}
```

## Motor de Sorteos

### Algoritmo Determinístico
1. Recibir lista de participantes
2. Ordenar alfabéticamente
3. Generar hash SHA-256 de participantes
4. Usar hash como semilla para PRNG
5. Seleccionar N ganadores sin repetición
6. Generar hash de verificación (participantesHash + timestamp)

### PRNG (Pseudo-Random Number Generator)
- Algoritmo: Linear Congruential Generator
- Semilla: Hash de participantes + timestamp
- Salida: Números entre 0 y 1
- Determinístico: Misma semilla = mismos resultados

## Endpoints

### Autenticación
- `POST /api/auth/register`
  - Input: `{ email, password, nombre }`
  - Output: `{ token, usuario }`
  - Lógica: Hashear contraseña, crear usuario, generar JWT

- `POST /api/auth/login`
  - Input: `{ email, password }`
  - Output: `{ token, usuario }`
  - Lógica: Verificar credenciales, generar JWT

- `GET /api/auth/me`
  - Input: Header `Authorization: Bearer <token>`
  - Output: `{ id, email, nombre, rol, bloqueado }`
  - Lógica: Decodificar JWT, buscar usuario

### Sorteos
- `POST /api/sorteos`
  - Input: `{ titulo, urlPublicacion, redSocial, cantidadGanadores, cantidadSuplentes }`
  - Output: `{ sorteo: { id, titulo, estado, ganadores, suplentes, hashVerificacion } }`
  - Lógica: Validar límite, scraping, motor de sorteos

- `GET /api/sorteos`
  - Input: Header `Authorization: Bearer <token>`
  - Output: `[{ id, titulo, estado, createdAt, certificados }]`
  - Lógica: Buscar sorteos del usuario

- `GET /api/sorteos/:id`
  - Input: `:id` en URL
  - Output: `{ id, titulo, estado, hashVerificacion, certificados }`
  - Lógica: Buscar sorteo por ID

### Pagos
- `POST /api/pagos/checkout`
  - Input: `{ sorteoId }`
  - Output: `{ checkoutUrl, sandboxCheckoutUrl, preferenceId }`
  - Lógica: Crear preferencia Mercado Pago

- `POST /api/pagos/webhook`
  - Input: Notificación Mercado Pago
  - Output: `{ received: true }`
  - Lógica: Verificar firma, procesar pago

## Scraping

### Instagram
- Navegar a URL de post
- Esperar carga de comentarios
- Extraer nombres de usuarios
- Retornar lista única

### TikTok
- Navegar a URL de video
- Esperar carga de comentarios
- Extraer nombres de usuarios
- Retornar lista única

### YouTube
- Navegar a URL de video
- Esperar carga de comentarios
- Extraer nombres de usuarios
- Retornar lista única

## Seguridad

### Autenticación
- JWT tokens con expiración 24h
- Bcrypt con 10 salt rounds
- Middleware en rutas protegidas

### Webhooks
- Verificación HMAC-SHA256
- Secret en variables de entorno
- Rechazo de firmas inválidas

### Rate Limiting
- Límite de 3 sorteos por mes
- Validación en backend
- Prevención de abuso
