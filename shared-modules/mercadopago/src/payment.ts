import { createHmac, timingSafeEqual } from 'crypto';
import { MercadoPagoClient } from './client';
import { PaymentConfig, PaymentRequest, PaymentResponse, UsagePaymentConfig } from './types';

function notificationUrl(request?: { notificationUrl?: string }): string | undefined {
  if (request?.notificationUrl) return request.notificationUrl;
  const envUrl = process.env.MERCADO_PAGO_NOTIFICATION_URL;
  if (envUrl) return envUrl;
  // Fallback: ruta del webhook dentro del API. Solo aplica si API_BASE_URL
  // apunta a la API (no a la web). Si no, se omite y MP usa la configurada en el panel.
  const baseApi = process.env.API_BASE_URL || process.env.APP_BASE_URL;
  if (baseApi) return `${baseApi}/api/pagos/webhook`;
  return undefined;
}

/**
 * Crea un pago por uso simple (pago único)
 */
export async function createUsagePayment(
  config: PaymentConfig,
  usageConfig: UsagePaymentConfig,
  externalReference: string
): Promise<PaymentResponse> {
  const client = new MercadoPagoClient(config);
  
  const {
    pricePerRaffle,
    currency = 'ARS',
    description = 'Pago por sorteo',
  } = usageConfig;

  const notification = notificationUrl();

  const preferenceData = {
    items: [
      {
        title: description,
        description: description,
        unit_price: pricePerRaffle,
        quantity: 1,
        currency_id: currency,
      },
    ],
    external_reference: externalReference,
    back_urls: {
      success: `${process.env.APP_BASE_URL}/payment/success`,
      failure: `${process.env.APP_BASE_URL}/payment/failure`,
      pending: `${process.env.APP_BASE_URL}/payment/pending`,
    },
    auto_return: 'approved',
    ...(notification ? { notification_url: notification } : {}),
  };

  const response = await client.createPreference(preferenceData);
  
  return {
    init_point: response.init_point,
    sandbox_init_point: response.sandbox_init_point,
    id: response.id,
  };
}

/**
 * Verifica la firma del webhook de Mercado Pago.
 * MP firma un manifest con formato `id:{dataId};request-id:{xRequestId};ts:{ts};`
 * (las partes vacías se omiten) con HMAC-SHA256 y el secret del webhook.
 */
export function verifyWebhookSignature(
  xSignature: string,
  xRequestId: string | undefined,
  dataId: string | undefined,
  secret: string
): boolean {
  try {
    const parts: Record<string, string> = {};
    for (const part of xSignature.split(',')) {
      const idx = part.indexOf('=');
      if (idx === -1) continue;
      parts[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
    }
    const ts = parts['ts'];
    const v1 = parts['v1'];
    if (!ts || !v1) return false;

    const manifestParts: string[] = [];
    if (dataId) manifestParts.push(`id:${dataId.toLowerCase()}`);
    if (xRequestId) manifestParts.push(`request-id:${xRequestId}`);
    manifestParts.push(`ts:${ts}`);
    const manifest = manifestParts.join(';') + ';';

    const calculated = createHmac('sha256', secret).update(manifest).digest('hex');

    const a = Buffer.from(v1, 'utf8');
    const b = Buffer.from(calculated, 'utf8');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Crea un pago personalizado
 */
export async function createPayment(
  config: PaymentConfig,
  request: PaymentRequest
): Promise<PaymentResponse> {
  const client = new MercadoPagoClient(config);
  
  const {
    title,
    description,
    price,
    currency = 'ARS',
    quantity = 1,
    externalReference,
    successUrl,
    failureUrl,
    pendingUrl,
    notificationUrl: notificationUrlReq,
  } = request;

  const notification = notificationUrl();

  const preferenceData = {
    items: [
      {
        title,
        description,
        unit_price: price,
        quantity,
        currency_id: currency,
      },
    ],
    external_reference: externalReference,
    back_urls: {
      success: successUrl || `${process.env.APP_BASE_URL}/payment/success`,
      failure: failureUrl || `${process.env.APP_BASE_URL}/payment/failure`,
      pending: pendingUrl || `${process.env.APP_BASE_URL}/payment/pending`,
    },
    auto_return: 'approved',
    ...(notificationUrlReq || notification ? { notification_url: notificationUrlReq || notification } : {}),
  };

  const response = await client.createPreference(preferenceData);
  
  return {
    init_point: response.init_point,
    sandbox_init_point: response.sandbox_init_point,
    id: response.id,
  };
}
