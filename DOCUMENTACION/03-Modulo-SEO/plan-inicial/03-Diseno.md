# Diseño - Módulo SEO

## Arquitectura

### Estructura de Módulo
```
@shared/seo/
├── src/
│   ├── index.ts           ← Exportador principal
│   ├── types.ts           ← Tipos TypeScript
│   ├── metadata.ts        ← Meta tags HTML
│   ├── sitemap.ts         ← Sitemap XML
│   ├── robots.ts          ← Robots.txt
│   └── structured-data.ts ← JSON-LD
├── dist/                  ← Compilado TypeScript
└── package.json
```

### Diagrama de Flujo - Generación de Meta Tags
```
Usuario llama a generateMetadata()
    ↓
Recibe configuración (MetadataConfig)
    ↓
Genera meta tags básicos (title, description, keywords)
    ↓
Genera Open Graph tags
    ↓
Genera Twitter Card tags
    ↓
Genera alternate locales
    ↓
Retorna string HTML con todos los tags
```

## Tipos TypeScript

### MetadataConfig
```typescript
interface MetadataConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  locale?: string;
  alternateLocales?: string[];
  noIndex?: boolean;
}
```

### SitemapUrl
```typescript
interface SitemapUrl {
  url: string;
  lastModified?: Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}
```

### RobotsConfig
```typescript
interface RobotsConfig {
  allow?: string[];
  disallow?: string[];
  sitemap?: string;
  crawlDelay?: number;
}
```

### StructuredDataConfig
```typescript
interface StructuredDataConfig {
  '@context': string;
  '@type': string;
  [key: string]: any;
}
```

## Funciones Principales

### generateMetadata()
**Descripción:** Genera meta tags HTML
**Parámetros:** MetadataConfig
**Retorna:** string HTML
**Meta tags generados:**
- title
- description
- keywords
- canonical
- robots
- Open Graph (title, description, type, locale, url, image)
- Twitter Card (card, title, description, image)
- Alternate locales

### generateSitemap()
**Descripción:** Genera sitemap XML
**Parámetros:** SitemapUrl[], baseUrl
**Retorna:** string XML
**Estructura:**
- XML header
- urlset con urls
- Cada url con loc, lastmod, changefreq, priority

### generateRobotsTxt()
**Descripción:** Genera robots.txt
**Parámetros:** RobotsConfig
**Retorna:** string robots.txt
**Estructura:**
- User-agent: *
- Crawl-delay (opcional)
- Allow rules
- Disallow rules
- Sitemap (opcional)

### generateStructuredData()
**Descripción:** Genera JSON-LD
**Parámetros:** StructuredDataConfig
**Retorna:** string script HTML
**Estructura:**
- script type="application/ld+json"
- JSON del structured data

### generateOrganizationData()
**Descripción:** Genera structured data para organización
**Parámetros:** OrganizationData
**Retorna:** StructuredDataConfig
**Campos:**
- @context, @type, name, url
- logo, description (opcional)
- address (opcional)
- contactPoint (opcional)
- sameAs (opcional)

### generateProductData()
**Descripción:** Genera structured data para producto
**Parámetros:** ProductData
**Retorna:** StructuredDataConfig
**Campos:**
- @context, @type, name, description
- image, price, currency (opcional)
- availability, brand, category (opcional)

## Configuración por Defecto

### Locales Latinoamérica
```typescript
const DEFAULT_LOCALE = 'es-AR';
const DEFAULT_ALTERNATE_LOCALES = ['es-MX', 'es-CO', 'es-CL', 'es-PE', 'es-ES'];
```

### Robots Config
```typescript
const DEFAULT_ROBOTS_CONFIG: RobotsConfig = {
  allow: ['/'],
  disallow: ['/api/', '/admin/', '/private/'],
  crawlDelay: 10,
};
```

## Integración con Frameworks

### Next.js
```typescript
// Usar metadata nativo de Next.js
export const metadata = {
  title: 'Título',
  description: 'Descripción',
  openGraph: { ... },
  twitter: { ... },
};
```

### React (sin Next.js)
```typescript
// Usar dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: generateMetadata(config) }} />
```

### Otros Frameworks
```typescript
// Inyectar string HTML en head
document.head.innerHTML += generateMetadata(config);
```

## Optimización para Latinoamérica

### Meta Tags por Locale
- og:locale: Locale principal
- og:locale:alternate: Locales alternativos
- hreflang: Links alternativos (si aplica)

### Keywords Estratégicas
- "sorteos", "instagram", "tiktok", "youtube"
- "gratuito", "latinoamerica", "influencers", "marcas"
- Adaptadas por región cuando sea necesario

### Structured Data Local
- Organization con dirección local
- Product con currency local
- Contact info local

## Validación

### Meta Tags
- Validar contra Open Graph specification
- Validar contra Twitter Card specification
- Validar longitud de title (60 caracteres)
- Validar longitud de description (160 caracteres)

### Sitemap
- Validar contra sitemaps.org specification
- Validar XML structure
- Validar URLs válidas

### Structured Data
- Validar contra Schema.org
- Validar JSON structure
- Validar required fields

## Testing

### Unit Testing
- Test cada función con diferentes inputs
- Test edge cases (valores vacíos, null, undefined)
- Test tipos TypeScript

### Integration Testing
- Test integración con Next.js
- Test integración con React
- Test integración con otros frameworks

### Manual Testing
- Validar meta tags con herramientas de SEO
- Validar sitemap con Google Search Console
- Validar structured data con Rich Results Test
