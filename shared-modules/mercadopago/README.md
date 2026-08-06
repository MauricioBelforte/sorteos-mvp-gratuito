# Módulo de Mercado Pago - Pago por Uso

Módulo reutilizable de Mercado Pago para pagos por uso simple.

## Características

- **Pago por uso**: Pago único por sorteo/servicio
- **Simplicidad**: Integración mínima con Mercado Pago
- **Webhooks**: Verificación de firmas de webhooks
- **Sandbox**: Soporte para modo de pruebas
- **Reutilizable**: Puede usarse en MVP y versión completa

## Instalación

```bash
npm install @shared/mercadopago mercadopago
```

## Configuración

Variables de entorno:
```env
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxx (para pruebas) o PROD-xxx (para producción)
MERCADO_PAGO_WEBHOOK_SECRET=tu-secret-webhook
APP_BASE_URL=https://tu-dominio.com
```

## Uso

### Pago por Uso

```typescript
import { createUsagePayment } from '@shared/mercadopago';

const payment = await createUsagePayment(
  {
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
    webhookSecret: process.env.MERCADO_PAGO_WEBHOOK_SECRET,
  },
  {
    pricePerRaffle: 100, // Precio en ARS
    currency: 'ARS',
    description: 'Pago por sorteo',
  },
  'sorteo-id-123' // external_reference
);

// Redirigir al usuario a payment.init_point
```

### Verificación de Webhook

```typescript
import { verifyWebhookSignature } from '@shared/mercadopago';

const isValid = verifyWebhookSignature(
  signature,
  payload,
  process.env.MERCADO_PAGO_WEBHOOK_SECRET!
);
```

### Pago Personalizado

```typescript
import { createPayment } from '@shared/mercadopago';

const payment = await createPayment(
  {
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
  },
  {
    title: 'Sorteo Premium',
    description: 'Acceso a sorteo premium',
    price: 500,
    currency: 'ARS',
    externalReference: 'custom-ref-123',
  }
);
```

## Precios Sugeridos para Latinoamérica

- **Argentina**: $100 ARS por sorteo
- **México**: $50 MXN por sorteo
- **Colombia**: $2000 COP por sorteo
- **Chile**: $500 CLP por sorteo
- **Perú**: $3 PEN por sorteo

## Reutilización

Este módulo puede ser usado tanto en el MVP como en la versión completa del proyecto.
