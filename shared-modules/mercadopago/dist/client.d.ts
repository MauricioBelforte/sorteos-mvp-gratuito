import { PaymentConfig } from './types';
export declare class MercadoPagoClient {
    private accessToken;
    private webhookSecret?;
    private baseUrl;
    constructor(config: PaymentConfig);
    private request;
    getPayment(paymentId: number): Promise<any>;
    createPreference(data: any): Promise<any>;
}
//# sourceMappingURL=client.d.ts.map