export interface MetadataConfig {
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

export interface SitemapUrl {
  url: string;
  lastModified?: Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export interface RobotsConfig {
  allow?: string[];
  disallow?: string[];
  sitemap?: string;
  crawlDelay?: number;
}

export interface StructuredDataConfig {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export interface OrganizationData {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  contactPoint?: {
    telephone?: string;
    contactType?: string;
    email?: string;
  };
  sameAs?: string[];
}

export interface ProductData {
  name: string;
  description: string;
  image?: string;
  price?: string;
  currency?: string;
  availability?: string;
  brand?: string;
  category?: string;
}
