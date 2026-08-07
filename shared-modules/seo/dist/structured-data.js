"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStructuredData = generateStructuredData;
exports.generateOrganizationData = generateOrganizationData;
exports.generateProductData = generateProductData;
exports.generateSoftwareApplicationData = generateSoftwareApplicationData;
/**
 * Genera structured data JSON-LD para SEO
 */
function generateStructuredData(config) {
    return `<script type="application/ld+json">
${JSON.stringify(config, null, 2)}
</script>`;
}
/**
 * Genera structured data para organización (Schema.org)
 * Optimizado para empresas en Latinoamérica
 */
function generateOrganizationData(data) {
    const { name, url, logo, description, address, contactPoint, sameAs, } = data;
    const organization = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name,
        url,
    };
    if (logo) {
        organization.logo = logo;
    }
    if (description) {
        organization.description = description;
    }
    if (address) {
        organization.address = {
            '@type': 'PostalAddress',
            ...address,
        };
    }
    if (contactPoint) {
        organization.contactPoint = {
            '@type': 'ContactPoint',
            ...contactPoint,
        };
    }
    if (sameAs && sameAs.length > 0) {
        organization.sameAs = sameAs;
    }
    return organization;
}
/**
 * Genera structured data para producto/servicio
 */
function generateProductData(data) {
    const { name, description, image, price, currency = 'USD', availability = 'https://schema.org/InStock', brand, category, } = data;
    const product = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name,
        description,
    };
    if (image) {
        product.image = image;
    }
    if (price) {
        product.offers = {
            '@type': 'Offer',
            price,
            priceCurrency: currency,
            availability,
        };
    }
    if (brand) {
        product.brand = {
            '@type': 'Brand',
            name: brand,
        };
    }
    if (category) {
        product.category = category;
    }
    return product;
}
/**
 * Genera structured data para SoftwareApplication (para apps web)
 */
function generateSoftwareApplicationData(config) {
    const { name, description, url, applicationCategory = 'BusinessApplication', operatingSystem = 'Web', offers, } = config;
    const software = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name,
        description,
        url,
        applicationCategory,
        operatingSystem,
    };
    if (offers) {
        software.offers = {
            '@type': 'Offer',
            price: offers.price,
            priceCurrency: offers.priceCurrency,
        };
    }
    return software;
}
//# sourceMappingURL=structured-data.js.map