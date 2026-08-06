export interface PaymentConfig {
    accessToken: string;
    webhookSecret?: string;
}
export interface PaymentRequest {
    title: string;
    description: string;
    price: number;
    currency?: string;
    quantity?: number;
    externalReference?: string;
    successUrl?: string;
    failureUrl?: string;
    pendingUrl?: string;
    /** URL pública del endpoint de webhooks (p. ej. https://api.dominio.com/api/pagos/webhook). */
    notificationUrl?: string;
}
export interface PaymentResponse {
    init_point: string;
    sandbox_init_point: string;
    id: string;
}
export interface WebhookNotification {
    action: string;
    api_version: string;
    data: {
        id: string;
    };
    date_created: string;
    id: number;
    live_mode: boolean;
    type: string;
    user_id: number;
}
export interface PaymentStatus {
    id: number;
    status: 'pending' | 'approved' | 'rejected' | 'in_process' | 'cancelled';
    external_reference: string;
    transaction_amount: number;
    currency_id: string;
    date_approved?: string;
    date_created: string;
}
export interface UsagePaymentConfig {
    pricePerRaffle: number;
    currency?: string;
    description?: string;
}
//# sourceMappingURL=types.d.ts.map