import { PaymentConfig } from './types';

export class MercadoPagoClient {
  private accessToken: string;
  private webhookSecret?: string;
  private baseUrl: string;

  constructor(config: PaymentConfig) {
    this.accessToken = config.accessToken;
    this.webhookSecret = config.webhookSecret;
    // El sandbox se identifica por el token TEST- (nunca por un host distinto):
    // el host de la API de MercadoPago es SIEMPRE api.mercadopago.com.
    // (api.mercadopago.com/sandbox no existe y devuelve 404.)
    this.baseUrl = 'https://api.mercadopago.com';
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
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
      const errorMessage = (error as any).message || `HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async getPayment(paymentId: number): Promise<any> {
    return this.request(`/v1/payments/${paymentId}`);
  }

  async createPreference(data: any): Promise<any> {
    return this.request('/checkout/preferences', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
