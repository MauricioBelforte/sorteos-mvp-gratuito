"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultRobotsConfig = void 0;
exports.generateRobotsTxt = generateRobotsTxt;
/**
 * Genera robots.txt para SEO
 */
function generateRobotsTxt(config) {
    const { allow = ['*'], disallow = [], sitemap, crawlDelay, } = config;
    const lines = [];
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
exports.defaultRobotsConfig = {
    allow: ['/'],
    disallow: ['/api/', '/admin/', '/private/'],
    crawlDelay: 10,
};
//# sourceMappingURL=robots.js.map