import { StructuredDataConfig, OrganizationData, ProductData } from './types';
/**
 * Genera structured data JSON-LD para SEO
 */
export declare function generateStructuredData(config: StructuredDataConfig): string;
/**
 * Genera structured data para organización (Schema.org)
 * Optimizado para empresas en Latinoamérica
 */
export declare function generateOrganizationData(data: OrganizationData): StructuredDataConfig;
/**
 * Genera structured data para producto/servicio
 */
export declare function generateProductData(data: ProductData): StructuredDataConfig;
/**
 * Genera structured data para SoftwareApplication (para apps web)
 */
export declare function generateSoftwareApplicationData(config: {
    name: string;
    description: string;
    url: string;
    applicationCategory?: string;
    operatingSystem?: string;
    offers?: {
        price: string;
        priceCurrency: string;
    };
}): StructuredDataConfig;
//# sourceMappingURL=structured-data.d.ts.map