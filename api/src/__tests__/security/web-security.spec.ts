import axios from 'axios';

const WEB_URL = process.env.WEB_URL || 'http://localhost:3000';

describe('Web Security Testing', () => {
  describe('Security Headers (B-07)', () => {
    it('should have security headers on HTML responses', async () => {
      const response = await axios.get(WEB_URL, { validateStatus: () => true });

      const headers = response.headers;
      const missingHeaders = [];

      if (!headers['x-content-type-options']) missingHeaders.push('X-Content-Type-Options');
      if (!headers['x-frame-options']) missingHeaders.push('X-Frame-Options');
      if (!headers['x-xss-protection']) missingHeaders.push('X-XSS-Protection');
      if (!headers['referrer-policy']) missingHeaders.push('Referrer-Policy');
      if (headers['x-powered-by']) missingHeaders.push('X-Powered-By');

      if (missingHeaders.length > 0) {
        console.warn(`WEB SECURITY HEADERS BUG: Missing: ${missingHeaders.join(', ')}`);
      }
      expect(missingHeaders.length).toBe(0);
    });
  });

  describe('MetadataBase (B-08)', () => {
    it('should have metadataBase configured in layout', async () => {
      const response = await axios.get(WEB_URL, { validateStatus: () => true });
      const html = response.data as string;

      const hasMetadataBase = html.includes('metadataBase') ||
                              html.includes('metadata base') ||
                              html.includes('verification') ||
                              html.includes('site verification');

      // Next.js 14+ requiere metadataBase para verificación de dominio y SEO
      if (!hasMetadataBase) {
        console.warn('METADATABASE BUG: metadataBase not found in layout.tsx');
      }
      expect(hasMetadataBase).toBe(true);
    });
  });

  describe('XSS Prevention', () => {
    it('should not reflect user input in HTML', async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      const response = await axios.get(`${WEB_URL}?q=${encodeURIComponent(xssPayload)}`, {
        validateStatus: () => true,
      });

      const html = response.data as string;
      const reflected = html.includes(xssPayload);

      if (reflected) {
        console.warn('XSS BUG: User input reflected in HTML');
      }
      expect(reflected).toBe(false);
    });
  });
});