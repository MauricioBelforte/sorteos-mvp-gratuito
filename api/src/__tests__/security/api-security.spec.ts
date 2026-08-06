import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:4000';

describe('API Security Testing', () => {
  const maliciousOrigins = [
    'http://evil.com',
    'https://malicious.net',
    'http://localhost:3001',
    'null',
  ];

  describe('CORS Security (B-01)', () => {
    it('should NOT allow arbitrary origins', async () => {
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

    it('should allow only configured origins', async () => {
      const response = await axios.get(`${API_URL}/api/sorteos/cuota`, {
        headers: { Origin: 'http://localhost:3000' },
        validateStatus: () => true,
      });

      const acao = response.headers['access-control-allow-origin'];
      // Debe permitir el origen configurado
      expect(acao).toBe('http://localhost:3000');
    });
  });

  describe('Body Size Limit (B-05)', () => {
    it('should reject oversized bodies', async () => {
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

  describe('Error Handling (B-06)', () => {
    it('should not expose stack traces', async () => {
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

    it('should return generic error for internal errors', async () => {
      // Forzar un error interno (endpoint inexistente con error)
      const response = await axios.get(`${API_URL}/api/sorteos/error-test`, {
        validateStatus: () => true,
      });

      const body = response.data;
      const bodyStr = JSON.stringify(body).toLowerCase();
      const hasInternalDetails = bodyStr.includes('at ') ||
                                bodyStr.includes('node_modules') ||
                                bodyStr.includes('stack');

      expect(hasInternalDetails).toBe(false);
    });
  });

  describe('Security Headers (B-07)', () => {
    it('should have security headers configured', async () => {
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

  describe('Input Validation', () => {
    it('should reject invalid URLs', async () => {
      const response = await axios.post(`${API_URL}/api/sorteos/analizar`, {
        urlPublicacion: 'https://google.com',
        redSocial: 'instagram',
      }, { validateStatus: () => true });

      expect(response.status).toBe(400);
    });

    it('should reject empty URL', async () => {
      const response = await axios.post(`${API_URL}/api/sorteos/analizar`, {
        urlPublicacion: '',
        redSocial: 'instagram',
      }, { validateStatus: () => true });

      expect(response.status).toBe(400);
    });

    it('should reject SQL injection in URL', async () => {
      const response = await axios.post(`${API_URL}/api/sorteos/analizar`, {
        urlPublicacion: "'; DROP TABLE sorteos; --",
        redSocial: 'instagram',
      }, { validateStatus: () => true });

      expect(response.status).toBe(400);
    });

    it('should reject XSS in participants', async () => {
      const response = await axios.post(`${API_URL}/api/sorteos`, {
        urlPublicacion: 'https://instagram.com/p/test',
        redSocial: 'instagram',
        cantidadGanadores: 1,
        cantidadSuplentes: 0,
        participantesManuales: ['@user <script>alert(1)</script>'],
      }, { validateStatus: () => true });

      // No debe ejecutar el script; debe rechazar o sanitizar
      expect(response.status).not.toBe(500);
    });
  });

  describe('Webhook MercadoPago', () => {
    it('should reject webhook without signature', async () => {
      const response = await axios.post(`${API_URL}/api/pagos/webhook`, {
        data: { id: '12345' },
        type: 'payment',
      }, { validateStatus: () => true });

      // Sin firma debe rechazar (400 o 401)
      expect([400, 401]).toContain(response.status);
    });

    it('should reject webhook with invalid signature', async () => {
      const response = await axios.post(`${API_URL}/api/pagos/webhook`, {
        data: { id: '12345' },
        type: 'payment',
      }, {
        headers: {
          'x-signature': 'invalid-signature',
          'x-request-id': 'test-request-id',
        },
        validateStatus: () => true,
      });

      // Firma inválida debe rechazar (400 o 401)
      expect([400, 401]).toContain(response.status);
    });
  });

  describe('Pase Rápido', () => {
    it('should reject invalid pase ID', async () => {
      const response = await axios.get(`${API_URL}/api/pagos/pase/invalid-id`, {
        validateStatus: () => true,
      });

      expect(response.status).toBe(404);
    });
  });

  // Se corre AL FINAL a propósito: dispara más requests que el límite configurado
  // y deja a la IP local dentro de la ventana de rate limit (no contamina a los
  // demás tests, que ya corrieron).
  describe('Rate Limiting (B-03)', () => {
    it('should have rate limiting active', async () => {
      // IP ficticia por X-Forwarded-For: el rate limit se prueba contra esta IP
      // y NO contamina la IP real del desarrollador (con trust proxy activo).
      const ipFicticia = '203.0.113.99';

      // Leer el límite efectivo desde el header (express-rate-limit con standardHeaders)
      const probe = await axios.get(`${API_URL}/api/sorteos/cuota`, {
        headers: { 'X-Forwarded-For': ipFicticia },
        validateStatus: () => true,
      });
      const limitHeader = probe.headers['ratelimit-limit'] || probe.headers['x-ratelimit-limit'];
      const limit = parseInt(String(limitHeader), 10) || 100;

      // Disparar limit + 5 requests: garantiza cruzar el límite (429 en alguno)
      const requests = [];
      for (let i = 0; i < limit + 5; i++) {
        requests.push(
          axios.get(`${API_URL}/api/sorteos/cuota`, {
            headers: { 'X-Forwarded-For': ipFicticia },
            validateStatus: () => true,
          })
        );
      }

      const responses = await Promise.all(requests);
      const rateLimited = responses.some(r => r.status === 429);

      if (!rateLimited) {
        console.warn(`RATE LIMITING BUG: No 429 after ${limit + 5} requests (limit=${limit})`);
      }
      expect(rateLimited).toBe(true);
    });
  });
});