"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMetadata = generateMetadata;
exports.generateOpenGraph = generateOpenGraph;
exports.generateTwitterCard = generateTwitterCard;
/**
 * Genera meta tags HTML para SEO
 * Optimizado para Latinoamérica con soporte multi-idioma
 */
function generateMetadata(config) {
    const { title, description, keywords, canonical, ogImage, ogType = 'website', locale = 'es-AR', alternateLocales = ['es-MX', 'es-CO', 'es-CL', 'es-PE', 'es-ES'], noIndex = false, } = config;
    const metaTags = [];
    // Meta tags básicos
    metaTags.push(`<title>${title}</title>`);
    metaTags.push(`<meta name="description" content="${description}">`);
    if (keywords && keywords.length > 0) {
        metaTags.push(`<meta name="keywords" content="${keywords.join(', ')}">`);
    }
    // Canonical
    if (canonical) {
        metaTags.push(`<link rel="canonical" href="${canonical}">`);
    }
    // Robots
    if (noIndex) {
        metaTags.push(`<meta name="robots" content="noindex, nofollow">`);
    }
    else {
        metaTags.push(`<meta name="robots" content="index, follow">`);
    }
    // Open Graph
    metaTags.push(`<meta property="og:title" content="${title}">`);
    metaTags.push(`<meta property="og:description" content="${description}">`);
    metaTags.push(`<meta property="og:type" content="${ogType}">`);
    metaTags.push(`<meta property="og:locale" content="${locale}">`);
    if (canonical) {
        metaTags.push(`<meta property="og:url" content="${canonical}">`);
    }
    if (ogImage) {
        metaTags.push(`<meta property="og:image" content="${ogImage}">`);
    }
    // Alternate locales para Latinoamérica
    alternateLocales.forEach(altLocale => {
        metaTags.push(`<meta property="og:locale:alternate" content="${altLocale}">`);
    });
    // Twitter Card
    metaTags.push(`<meta name="twitter:card" content="summary_large_image">`);
    metaTags.push(`<meta name="twitter:title" content="${title}">`);
    metaTags.push(`<meta name="twitter:description" content="${description}">`);
    if (ogImage) {
        metaTags.push(`<meta name="twitter:image" content="${ogImage}">`);
    }
    return metaTags.join('\n');
}
/**
 * Genera metadatos específicos para Open Graph
 */
function generateOpenGraph(config) {
    const { title, description, canonical, ogImage, ogType = 'website', locale = 'es-AR', } = config;
    return {
        'og:title': title,
        'og:description': description,
        'og:type': ogType,
        'og:locale': locale,
        ...(canonical && { 'og:url': canonical }),
        ...(ogImage && { 'og:image': ogImage }),
    };
}
/**
 * Genera metadatos específicos para Twitter Card
 */
function generateTwitterCard(config) {
    const { title, description, ogImage, } = config;
    return {
        'twitter:card': 'summary_large_image',
        'twitter:title': title,
        'twitter:description': description,
        ...(ogImage && { 'twitter:image': ogImage }),
    };
}
//# sourceMappingURL=metadata.js.map