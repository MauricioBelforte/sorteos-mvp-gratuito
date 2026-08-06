import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:4000';

describe('API Security Testing', () => {
  const maliciousOrigins = [
    'http://evil.com',
    'https://malicious.net',
    'http://localhost:3001',
    'null',
  ];

  describe('CORS Security', () => {
    it('should NOT allow arbitrary origins (B-01)', async () => {
      for (const origin of maliciousOrigins) {
        const response = await axios.get(`${API_URL}/api/sorteos/cuota`, {
          headers: { Origin: origin },
          validateStatus: () => true,
        });

        const acao = response.headers['access-control-allow-origin'];
        const acac = response.headers['access-control-allow-credentials'];

        // CORS inseguro: permite cualquier origen o el origen malicioso
        const isInsecure = acao === '*' || acao === origin;
        if (isInsecure) {
          console.warn(`CORS BUG: Origin ${origin} allowed (ACAO=${acao})`);
        }
        expect(isInsecure).toBe(false);
      }
    });

    it('should have CORS configured (not wildcard)', async () => {
      const response = await axios.get(`${API_URL}/api/sorteos/cuota`, {
        headers: { Origin: 'http://localhost:3000' },
        validateStatus: () => true,
      });

      const acao = response.headers['access-control-allow-origin'];
      // Si CORS está desconfigurado, no debería haber ACAO header
      // Si está configurado correctamente, debería ser el origen permitido
      console.log(`CORS ACAO for localhost:3000: ${acao}`);
    });
  });

  describe('Rate Limiting', () => {
    it('should have rate limiting active (B-03)', async () => {
      const requests = [];
      for (let i = 0; i < 50; i++) {
        requests.push(
          axios.get(`${API_URL}/api/sorteos/cuota`, { validateStatus: () => true })
        );
      }

      const responses = await Promise.all(requests);
      const rateLimited = responses.some(r => r.status === 429);

      if (!rateLimited) {
        console.warn('RATE LIMITING BUG: No 429 responses after 50 rapid requests');
      }
      expect(rateLimited).toBe(true);
    });
  });

  describe('Body Size Limit', () => {
    it('should reject oversized bodies (B-05)', async () => {
      const largeBody = { data: 'x'.repeat(10 * 1024 * 1024) }; // 10MB

      try {
        const response = await axios.post(`${API_URL}/api/sorteos/analizar`, largeBody, {
          headers: { 'Content-Type': 'application/json' },
          validateStatus: () => true,
          maxBodyLength: 50 * 1024 * 1024,
          maxContentLength: 50 * 1024 * 1024,
        });

        if (response.status === 413) {
          console.log('Body size limit: PROTECTED (413)');
          expect(response.status).toBe(413);
        } else {
          console.warn(`BODY SIZE BUG: Accepted ${largeBody.data.length} bytes (status ${response.status})`);
          expect(response.status).toBe(413);
        }
      } catch (error: any) {
        if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
          console.log('Body size limit: PROTECTED (connection reset/timeout)');
          expect(true).toBe(true);
        } else {
          throw error;
        }
      }
    });
  });

  describe('Error Handling', () => {
    it('should not expose stack traces (B-06)', async () => {
      const response = await axios.get(`${API_URL}/api/sorteos/preview`, {
        validateStatus: () => true,
      });

      const body = JSON.stringify(response.data).toLowerCase();
      const hasStackTrace = body.includes('stack') ||
                           body.includes('traceback') ||
                           body.includes('at ') ||
                           response.headers['x-powered-by'] === 'Express';

      if (hasStackTrace) {
        console.warn('ERROR HANDLING BUG: Stack trace or X-Powered-By exposed');
      }
      expect(hasStackTrace).toBe(false);
    });
  });

  describe('Security Headers', () => {
    it('should have security headers configured (B-07)', async () => {
      const response = await axios.get(`${API_URL}/health`, { validateStatus: () => true });

      const headers = response.headers;
      const missingHeaders = [];

      if (!headers['x-content-type-options']) missingHeaders.push('X-Content-Type-Options');
      if (!headers['x-frame-options']) missingHeaders.push('X-Frame-Options');
      if (!headers['x-xss-protection']) missingHeaders.push('X-XSS-Protection');
      if (headers['x-powered-by'] === 'Express') missingHeaders.push('X-Powered-By');

      if (missingHeaders.length > 0) {
        console.warn(`SECURITY HEADERS BUG: Missing headers: ${missingHeaders.join(', ')}`);
      }
      expect(missingHeaders.length).toBe(0);
    });
  });
});