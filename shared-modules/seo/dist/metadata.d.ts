import { MetadataConfig } from './types';
/**
 * Genera meta tags HTML para SEO
 * Optimizado para Latinoamérica con soporte multi-idioma
 */
export declare function generateMetadata(config: MetadataConfig): string;
/**
 * Genera metadatos específicos para Open Graph
 */
export declare function generateOpenGraph(config: MetadataConfig): Record<string, string>;
/**
 * Genera metadatos específicos para Twitter Card
 */
export declare function generateTwitterCard(config: MetadataConfig): Record<string, string>;
//# sourceMappingURL=metadata.d.ts.map