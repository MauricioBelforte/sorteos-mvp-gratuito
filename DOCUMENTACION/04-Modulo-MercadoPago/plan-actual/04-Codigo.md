# Código - Módulo Mercado Pago

## Archivos Principales

### shared-modules/mercadopago/src/index.ts
**Descripción:** Exportador principal del módulo
**Funciones clave:**
- Exporta MercadoPagoClient
- Exporta funciones de pago
- Exporta tipos

**Archivos involucrados:**
- `./client.ts`
- `./payment.ts`
- `./types.ts`

**Logs relacionados:** Logs de compilación, errores de importación

### shared-modules/mercadopago/src/types.ts
**Descripción:** Definición de tipos TypeScript
**Funciones clave:**
- PaymentConfig
- PaymentRequest
- PaymentResponse
- WebhookNotification
- PaymentStatus
- UsagePaymentConfig

**Archivos involucrados:**
- Ninguno (solo definiciones de tipos)

**Logs relacionados:** Logs de tipos, errores de TypeScript

### shared-modules/mercadopago/src/client.ts
**Descripción:** Cliente de API de Mercado Pago
**Funciones clave:**
- MercadoPagoClient class
- constructor(config: PaymentConfig)
- createPreference(request: PaymentRequest)
- getPayment(paymentId: string)

**Archivos involucrados:**
- `./types.ts`
- SDK de Mercado Pago

**Logs relacionados:** Logs de API, errores de Mercado Pago

### shared-modules/mercadopago/src/payment.ts
**Descripción:** Funciones de pago y webhooks
**Funciones clave:**
- createUsagePayment()
- createPayment()
- verifyWebhookSignature()

**Archivos involucrados:**
- `./types.ts`
- `./client.ts`

**Logs relacionados:** Logs de pagos, errores de webhooks

## Dependencias Principales

### package.json
```json
{
  "name": "@shared/mercadopago",
  "version": "1.0.0",
  "description": "Módulo de pagos Mercado Pago reutilizable",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "mercadopago": "^2.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

## tsconfig.json

### Configuración
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022", "DOM"],
    "types": ["node"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Comandos de Ejecución

### Desarrollo
```bash
npm run dev  # tsc --watch
```

### Build
```bash
npm run build  # tsc
```

## Clases y Funciones Detalladas

### MercadoPagoClient
```typescript
class MercadoPagoClient {
  constructor(config: PaymentConfig)
  async createPreference(request: PaymentRequest): Promise<PaymentResponse>
  async getPayment(paymentId: string): Promise<any>
}
```
**Descripción:** Cliente de API de Mercado Pago
**Configuración:**
- accessToken: Token de acceso de Mercado Pago
- webhookSecret: Secret para verificación de webhooks
- sandbox: Boolean para modo sandbox

**Métodos:**
- createPreference(): Crea preferencia de pago
- getPayment(): Obtiene detalles de pago

### createUsagePayment()
```typescript
function createUsagePayment(
  config: PaymentConfig,
  usageConfig: UsagePaymentConfig,
  referenceId: string
): Promise<PaymentResponse>
```
**Descripción:** Crea pago por uso
**Parámetros:**
- config: Configuración de Mercado Pago
- usageConfig: Configuración de pago por uso
- referenceId: ID de referencia (ej: sorteoId)

**Retorna:** PaymentResponse con URLs de checkout

**Lógica:**
1. Crea instancia de MercadoPagoClient
2. Genera PaymentRequest con config de uso
3. Llama a createPreference()
4. Retorna PaymentResponse

### createPayment()
```typescript
function createPayment(
  config: PaymentConfig,
  request: PaymentRequest
): Promise<PaymentResponse>
```
**Descripción:** Crea pago personalizado
**Parámetros:**
- config: Configuración de Mercado Pago
- request: Request de pago personalizado

**Retorna:** PaymentResponse con URLs de checkout

**Lógica:**
1. Crea instancia de MercadoPagoClient
2. Llama a createPreference() con request
3. Retorna PaymentResponse

### verifyWebhookSignature()
```typescript
function verifyWebhookSignature(
  signature: string,
  payload: string,
  secret: string
): boolean
```
**Descripción:** Verifica firma de webhook
**Parámetros:**
- signature: Firma del header x-signature
- payload: Body del webhook como string
- secret: Webhook secret

**Retorna:** boolean (true si válido, false si inválido)

**Lógica:**
1. Genera HMAC-SHA256 del payload con secret
2. Compara con signature recibido
3. Retorna true si coincide, false si no

## Uso en Proyectos

### Instalación
```bash
npm install @shared/mercadopago
```

### Uso en Express
```typescript
import { createUsagePayment, verifyWebhookSignature } from '@shared/mercadopago';

// Crear pago
app.post('/api/pagos/checkout', async (req, res) => {
  const payment = await createUsagePayment(
    { accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN },
    { pricePerRaffle: 100, currency: 'ARS', description: 'Sorteo' },
    req.body.sorteoId
  );
  res.json({ checkoutUrl: payment.init_point });
});

// Webhook
app.post('/api/pagos/webhook', async (req, res) => {
  const signature = req.headers['x-signature'];
  const payload = JSON.stringify(req.body);
  const isValid = verifyWebhookSignature(
    signature,
    payload,
    process.env.MERCADO_PAGO_WEBHOOK_SECRET
  );
  if (!isValid) return res.status(401).json({ error: 'Firma inválida' });
  // Procesar webhook
});
```

### Uso en Next.js API Routes
```typescript
import { createUsagePayment } from '@shared/mercadopago';

export async function POST(req: Request) {
  const payment = await createUsagePayment(
    { accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN },
    { pricePerRaffle: 100, currency: 'ARS', description: 'Sorteo' },
    sorteoId
  );
  return Response.json({ checkoutUrl: payment.init_point });
}
```

## Variables de Entorno

### Backend (.env)
```env
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxx-o-PROD-xxx
MERCADO_PAGO_WEBHOOK_SECRET=tu-secret-webhook
```

## TestingManual

### Creación de Pago
1. Llamar a createUsagePayment() con config válida
2. Verificar que se retorne PaymentResponse
3. Verificar que init_point sea URL válida
4. Verificar que sandbox_init_point sea URL válida

### Verificación de Webhook
1. Recibir webhook de Mercado Pago
2. Extraer firma del header x-signature
3. Llamar a verifyWebhookSignature()
4. Verificar que retorne true para firma válida
5. Verificar que retorne false para firma inválida

## Errores Comunes

### Error: "Cannot find module '@shared/mercadopago'"
**Solución:** Ejecutar `npm install @shared/mercadopago` en el proyecto

### Error: "Invalid access token"
**Solución:** Verificar MERCADO_PAGO_ACCESS_TOKEN en .env

### Error: "Webhook signature invalid"
**Solución:** Verificar MERCADO_PAGO_WEBHOOK_SECRET en .env

### Error: "Type 'X' is not assignable to type 'Y'"
**Solución:** Verificar tipos TypeScript en types.ts
