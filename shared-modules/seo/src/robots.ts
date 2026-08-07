import { RobotsConfig } from './types';

/**
 * Genera robots.txt para SEO
 */
export function generateRobotsTxt(config: RobotsConfig): string {
  const {
    allow = ['*'],
    disallow = [],
    sitemap,
    crawlDelay,
  } = config;

  const lines: string[] = [];

  lines.push('User-agent: *');

  if (crawlDelay) {
    lines.push(`Crawl-delay: ${crawlDelay}`);
  }

  allow.forEach(path => {
    lines.push(`Allow: ${path}`);
  });

  disallow.forEach(path => {
    lines.push(`Disallow: ${path}`);
  });

  if (sitemap) {
    lines.push(`Sitemap: ${sitemap}`);
  }

  return lines.join('\n');
}

/**
 * Configuración por defecto para robots.txt
 */
export const defaultRobotsConfig: RobotsConfig = {
  allow: ['/'],
  disallow: ['/api/', '/admin/', '/private/'],
  crawlDelay: 10,
};
