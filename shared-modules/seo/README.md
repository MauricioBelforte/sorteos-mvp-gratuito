# Módulo de SEO Técnico - Latinoamérica

Módulo reutilizable de SEO técnico optimizado para Latinoamérica.

## Características

- **Meta tags**: Generación automática de meta tags para SEO
- **Open Graph**: Soporte completo para redes sociales
- **Twitter Cards**: Optimización para Twitter
- **Sitemap**: Generación de sitemap XML
- **Robots.txt**: Configuración de robots.txt
- **Structured Data**: JSON-LD para Schema.org
- **Multi-idioma**: Soporte para español latinoamericano (AR, MX, CO, CL, PE, ES)

## Instalación

```bash
npm install @shared/seo
```

## Uso

### Meta Tags

```typescript
import { generateMetadata } from '@shared/seo';

const meta = generateMetadata({
  title: 'Sorteos Gratuitos - Sistema de sorteos online',
  description: 'Realiza sorteos en Instagram, TikTok y YouTube gratis',
  keywords: ['sorteos', 'instagram', 'tiktok', 'youtube', 'gratuito'],
  canonical: 'https://sorteos.com',
  ogImage: 'https://sorteos.com/og-image.jpg',
  locale: 'es-AR',
});
```

### Sitemap

```typescript
import { generateSitemap } from '@shared/seo';

const sitemap = generateSitemap([
  { url: 'https://sorteos.com', priority: 1.0 },
  { url: 'https://sorteos.com/dashboard', priority: 0.8 },
], 'https://sorteos.com');
```

### Structured Data

```typescript
import { generateOrganizationData, generateStructuredData } from '@shared/seo';

const orgData = generateOrganizationData({
  name: 'Sorteos App',
  url: 'https://sorteos.com',
  description: 'Plataforma de sorteos online',
});

const structuredData = generateStructuredData(orgData);
```

## Configuración por Defecto

El módulo viene preconfigurado para Latinoamérica con:
- Locales: es-AR, es-MX, es-CO, es-CL, es-PE, es-ES
- Robots.txt optimizado para SPA
- Sitemap con prioridades por defecto

## Reutilización

Este módulo puede ser usado tanto en el MVP como en la versión completa del proyecto.
