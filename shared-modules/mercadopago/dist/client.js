"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MercadoPagoClient = void 0;
class MercadoPagoClient {
    accessToken;
    webhookSecret;
    baseUrl;
    constructor(config) {
        this.accessToken = config.accessToken;
        this.webhookSecret = config.webhookSecret;
        // El sandbox se identifica por el token TEST- (nunca por un host distinto):
        // el host de la API de MercadoPago es SIEMPRE api.mercadopago.com.
        // (api.mercadopago.com/sandbox no existe y devuelve 404.)
        this.baseUrl = 'https://api.mercadopago.com';
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            const errorMessage = error.message || `HTTP ${response.status}`;
            throw new Error(errorMessage);
        }
        return response.json();
    }
    async getPayment(paymentId) {
        return this.request(`/v1/payments/${paymentId}`);
    }
    async createPreference(data) {
        return this.request('/checkout/preferences', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
}
exports.MercadoPagoClient = MercadoPagoClient;
//# sourceMappingURL=client.js.map