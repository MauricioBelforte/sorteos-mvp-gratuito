# Código - Módulo SEO

## Archivos Principales

### shared-modules/seo/src/index.ts
**Descripción:** Exportador principal del módulo
**Funciones clave:**
- Exporta todas las funciones del módulo
- Exporta todos los tipos

**Archivos involucrados:**
- `./metadata.ts`
- `./sitemap.ts`
- `./robots.ts`
- `./structured-data.ts`
- `./types.ts`

**Logs relacionados:** Logs de compilación, errores de importación

### shared-modules/seo/src/types.ts
**Descripción:** Definición de tipos TypeScript
**Funciones clave:**
- MetadataConfig
- SitemapUrl
- RobotsConfig
- StructuredDataConfig
- OrganizationData
- ProductData

**Archivos involucrados:**
- Ninguno (solo definiciones de tipos)

**Logs relacionados:** Logs de tipos, errores de TypeScript

### shared-modules/seo/src/metadata.ts
**Descripción:** Generación de meta tags HTML
**Funciones clave:**
- generateMetadata(config): Genera meta tags básicos
- generateOpenGraph(config): Genera Open Graph tags
- generateTwitterCard(config): Genera Twitter Card tags

**Archivos involucrados:**
- `./types.ts`

**Logs relacionados:** Logs de generación de meta tags

### shared-modules/seo/src/sitemap.ts
**Descripción:** Generación de sitemap XML
**Funciones clave:**
- generateSitemap(urls, baseUrl): Genera sitemap XML
- generateSitemapIndex(sitemaps, baseUrl): Genera sitemap index

**Archivos involucrados:**
- `./types.ts`

**Logs relacionados:** Logs de generación de sitemap

### shared-modules/seo/src/robots.ts
**Descripción:** Generación de robots.txt
**Funciones clave:**
- generateRobotsTxt(config): Genera robots.txt

**Archivos involucrados:**
- `./types.ts`

**Logs relacionados:** Logs de generación de robots.txt

### shared-modules/seo/src/structured-data.ts
**Descripción:** Generación de JSON-LD
**Funciones clave:**
- generateStructuredData(config): Genera JSON-LD genérico
- generateOrganizationData(data): Genera structured data para organización
- generateProductData(data): Genera structured data para producto
- generateSoftwareApplicationData(data): Genera structured data para software

**Archivos involucrados:**
- `./types.ts`

**Logs relacionados:** Logs de generación de structured data

## Dependencias Principales

### package.json
```json
{
  "name": "@shared/seo",
  "version": "1.0.0",
  "description": "Módulo de SEO técnico reutilizable optimizado para Latinoamérica",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

## tsconfig.json

### Configuración
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022", "DOM"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Comandos de Ejecución

### Desarrollo
```bash
npm run dev  # tsc --watch
```

### Build
```bash
npm run build  # tsc
```

## Funciones Detalladas

### generateMetadata()
```typescript
function generateMetadata(config: MetadataConfig): string
```
**Descripción:** Genera meta tags HTML completos
**Parámetros:**
- config: MetadataConfig con title, description, keywords, etc.

**Retorna:** String HTML con todos los meta tags

**Meta tags generados:**
- `<meta charset="UTF-8">`
- `<meta name="viewport">`
- `<meta name="title">`
- `<meta name="description">`
- `<meta name="keywords">`
- `<link rel="canonical">`
- `<meta name="robots">`
- Open Graph tags
- Twitter Card tags
- Alternate locale tags

### generateSitemap()
```typescript
function generateSitemap(urls: SitemapUrl[], baseUrl: string): string
```
**Descripción:** Genera sitemap XML
**Parámetros:**
- urls: Array de SitemapUrl
- baseUrl: URL base del sitio

**Retorna:** String XML del sitemap

**Estructura XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/page</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

### generateRobotsTxt()
```typescript
function generateRobotsTxt(config: RobotsConfig): string
```
**Descripción:** Genera robots.txt
**Parámetros:**
- config: RobotsConfig con allow, disallow, sitemap, crawlDelay

**Retorna:** String del robots.txt

**Estructura:**
```
User-agent: *
Crawl-delay: 10
Allow: /
Disallow: /api/
Disallow: /admin/
Sitemap: https://example.com/sitemap.xml
```

### generateStructuredData()
```typescript
function generateStructuredData(config: StructuredDataConfig): string
```
**Descripción:** Genera JSON-LD
**Parámetros:**
- config: StructuredDataConfig con @context, @type, etc.

**Retorna:** String script HTML con JSON-LD

**Estructura:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Nombre",
  "url": "https://example.com"
}
</script>
```

## Uso en Proyectos

### Instalación
```bash
npm install @shared/seo
```

### Uso en Next.js
```typescript
import { generateMetadata } from '@shared/seo';

export const metadata = {
  title: 'Título',
  description: 'Descripción',
  openGraph: { ... },
  twitter: { ... },
};
```

### Uso en React
```typescript
import { generateMetadata } from '@shared/seo';

const metaTags = generateMetadata({
  title: 'Título',
  description: 'Descripción',
  keywords: ['keyword1', 'keyword2'],
});

<div dangerouslySetInnerHTML={{ __html: metaTags }} />
```

### Uso en Node.js
```typescript
import { generateSitemap } from '@shared/seo';

const sitemap = generateSitemap(urls, 'https://example.com');
fs.writeFileSync('public/sitemap.xml', sitemap);
```

## Testing Manual

### Meta Tags
1. Llamar a generateMetadata() con configuración válida
2. Verificar que el HTML sea válido
3. Verificar que todos los tags estén presentes
4. Validar con herramientas de SEO

### Sitemap
1. Llamar a generateSitemap() con URLs válidas
2. Verificar que el XML sea válido
3. Validar con Google Search Console

### Structured Data
1. Llamar a generateStructuredData() con configuración válida
2. Verificar que el JSON sea válido
3. Validar con Rich Results Test

## Errores Comunes

### Error: "Cannot find module '@shared/seo'"
**Solución:** Ejecutar `npm install @shared/seo` en el proyecto

### Error: "Type 'X' is not assignable to type 'Y'"
**Solución:** Verificar tipos TypeScript en types.ts

### Error: Meta tags no aparecen
**Solución:** Verificar que el HTML se inyecte correctamente en head
