import { PaymentConfig, PaymentRequest, PaymentResponse, UsagePaymentConfig } from './types';
/**
 * Crea un pago por uso simple (pago único)
 */
export declare function createUsagePayment(config: PaymentConfig, usageConfig: UsagePaymentConfig, externalReference: string): Promise<PaymentResponse>;
/**
 * Verifica la firma del webhook de Mercado Pago.
 * MP firma un manifest con formato `id:{dataId};request-id:{xRequestId};ts:{ts};`
 * (las partes vacías se omiten) con HMAC-SHA256 y el secret del webhook.
 */
export declare function verifyWebhookSignature(xSignature: string, xRequestId: string | undefined, dataId: string | undefined, secret: string): boolean;
/**
 * Crea un pago personalizado
 */
export declare function createPayment(config: PaymentConfig, request: PaymentRequest): Promise<PaymentResponse>;
//# sourceMappingURL=payment.d.ts.map