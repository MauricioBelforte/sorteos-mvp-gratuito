"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSitemap = generateSitemap;
exports.generateSitemapIndex = generateSitemapIndex;
/**
 * Genera sitemap XML para SEO
 */
function generateSitemap(urls, baseUrl) {
    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
    const urlEntries = urls.map(url => {
        const lastMod = url.lastModified ? url.lastModified.toISOString() : new Date().toISOString();
        const changeFreq = url.changeFrequency || 'weekly';
        const priority = url.priority !== undefined ? url.priority : 0.5;
        return `  <url>
    <loc>${url.url}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${changeFreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    }).join('\n');
    const xmlFooter = `</urlset>`;
    return `${xmlHeader}\n${urlEntries}\n${xmlFooter}`;
}
/**
 * Genera sitemap index para múltiples sitemaps
 */
function generateSitemapIndex(sitemaps, baseUrl) {
    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
    const sitemapEntries = sitemaps.map(sitemap => {
        return `  <sitemap>
    <loc>${sitemap}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;
    }).join('\n');
    const xmlFooter = `</sitemapindex>`;
    return `${xmlHeader}\n${sitemapEntries}\n${xmlFooter}`;
}
//# sourceMappingURL=sitemap.js.map