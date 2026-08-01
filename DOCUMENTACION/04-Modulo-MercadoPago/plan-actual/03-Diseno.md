# Diseño - Módulo Mercado Pago

## Arquitectura

### Estructura de Módulo
```
@shared/mercadopago/
├── src/
│   ├── index.ts           ← Exportador principal
│   ├── types.ts           ← Tipos TypeScript
│   ├── client.ts          ← Cliente API
│   └── payment.ts         ← Funciones de pago
├── dist/                  ← Compilado TypeScript
└── package.json
```

### Diagrama de Flujo - Creación de Pago
```
Usuario llama a createUsagePayment()
    ↓
Recibe configuración (PaymentConfig, UsagePaymentConfig, referenceId)
    ↓
Crea instancia de MercadoPagoClient
    ↓
Genera preferencia de pago con Mercado Pago
    ↓
Configura items, back_urls, metadata
    ↓
Crea preferencia en Mercado Pago
    ↓
Retorna preferencia con URLs de checkout
```

### Diagrama de Flujo - Verificación de Webhook
```
Mercado Pago envía webhook
    ↓
Sistema recibe webhook con firma
    ↓
Llama a verifyWebhookSignature()
    ↓
Extrae firma del header
    ↓
Genera HMAC-SHA256 del payload
    ↓
Compara con firma recibida
    ↓
Retorna true si coincide, false si no
```

## Tipos TypeScript

### PaymentConfig
```typescript
interface PaymentConfig {
  accessToken: string;
  webhookSecret?: string;
  sandbox?: boolean;
}
```

### PaymentRequest
```typescript
interface PaymentRequest {
  title: string;
  description: string;
  price: number;
  currency: string;
  quantity: number;
  externalReference?: string;
  successUrl?: string;
  failureUrl?: string;
  pendingUrl?: string;
}
```

### PaymentResponse
```typescript
interface PaymentResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
  items: PaymentItem[];
}
```

### WebhookNotification
```typescript
interface WebhookNotification {
  type: string;
  data: {
    id: string;
  };
}
```

### UsagePaymentConfig
```typescript
interface UsagePaymentConfig {
  pricePerRaffle: number;
  currency: string;
  description: string;
}
```

## Clases y Funciones

### MercadoPagoClient
**Descripción:** Cliente de API de Mercado Pago
**Métodos:**
- `constructor(config: PaymentConfig)`
- `createPreference(request: PaymentRequest)`: Crea preferencia de pago
- `getPayment(paymentId: string)`: Obtiene detalles de pago
- `handleWebhook(notification: WebhookNotification)`: Maneja webhook

### createUsagePayment()
**Descripción:** Crea pago por uso
**Parámetros:**
- config: PaymentConfig
- usageConfig: UsagePaymentConfig
- referenceId: string (ID del sorteo)

**Retorna:** PaymentResponse

**Lógica:**
1. Crea instancia de MercadoPagoClient
2. Genera PaymentRequest con config de uso
3. Llama a createPreference()
4. Retorna PaymentResponse

### createPayment()
**Descripción:** Crea pago personalizado
**Parámetros:**
- config: PaymentConfig
- request: PaymentRequest

**Retorna:** PaymentResponse

**Lógica:**
1. Crea instancia de MercadoPagoClient
2. Llama a createPreference() con request
3. Retorna PaymentResponse

### verifyWebhookSignature()
**Descripción:** Verifica firma de webhook
**Parámetros:**
- signature: string (header x-signature)
- payload: string (body del webhook)
- secret: string (webhook secret)

**Retorna:** boolean

**Lógica:**
1. Genera HMAC-SHA256 del payload con secret
2. Compara con signature recibido
3. Retorna true si coincide, false si no

## Configuración por Defecto

### Sandbox vs Producción
```typescript
const DEFAULT_SANDBOX = true;
const DEFAULT_CURRENCY = 'ARS';
```

### Back URLs
```typescript
const DEFAULT_BACK_URLS = {
  success: 'https://example.com/success',
  failure: 'https://example.com/failure',
  pending: 'https://example.com/pending',
};
```

## Integración con Backend

### Express
```typescript
import { createUsagePayment, verifyWebhookSignature } from '@shared/mercadopago';

app.post('/api/pagos/checkout', async (req, res) => {
  const payment = await createUsagePayment(
    { accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN },
    { pricePerRaffle: 100, currency: 'ARS', description: 'Sorteo' },
    req.body.sorteoId
  );
  res.json({ checkoutUrl: payment.init_point });
});

app.post('/api/pagos/webhook', async (req, res) => {
  const signature = req.headers['x-signature'];
  const payload = JSON.stringify(req.body);
  const isValid = verifyWebhookSignature(signature, payload, process.env.MERCADO_PAGO_WEBHOOK_SECRET);
  if (!isValid) return res.status(401).json({ error: 'Firma inválida' });
  // Procesar webhook
});
```

### Next.js API Routes
```typescript
import { createUsagePayment, verifyWebhookSignature } from '@shared/mercadopago';

export async function POST(req: Request) {
  const payment = await createUsagePayment(
    { accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN },
    { pricePerRaffle: 100, currency: 'ARS', description: 'Sorteo' },
    sorteoId
  );
  return Response.json({ checkoutUrl: payment.init_point });
}
```

## Seguridad

### Verificación de Webhooks
- HMAC-SHA256 para firmas
- Secret en variables de entorno
- Rechazo de firmas inválidas
- Logs de webhooks recibidos

### Manejo de Tokens
- Access token en variables de entorno
- Nunca exponer en código
- Rotación periódica
- Separación sandbox/producción

### Validación de Datos
- Validar inputs antes de enviar
- Validar responses de API
- Manejo de errores robusto
- No exponer detalles sensibles

## Testing

### Unit Testing
- Test MercadoPagoClient con mock
- Test createUsagePayment con config válida
- Test verifyWebhookSignature con firma válida
- Test verifyWebhookSignature con firma inválida

### Integration Testing
- Test con sandbox de Mercado Pago
- Test creación de preferencias
- Test webhooks reales
- Test verificación de firmas

### Manual Testing
- Crear pago en sandbox
- Completar pago en sandbox
- Verificar webhook recibido
- Verificar firma verificada

## Manejo de Errores

### Errores de API
- Manejar errores de Mercado Pago
- Retornar mensajes de error claros
- Logs detallados para debugging
- No exponer detalles sensibles

### Errores de Webhook
- Manejar webhooks inválidos
- Manejar firmas inválidas
- Logs de webhooks fallidos
- Reintentos si aplica

### Errores de Configuración
- Validar configuración al iniciar
- Validar variables de entorno
- Error claro si config inválida
- Documentar configuración requerida
