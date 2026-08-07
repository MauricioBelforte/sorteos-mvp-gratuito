import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import authRoutes from './routes/auth';
import sorteosRoutes from './routes/sorteos';
import previewRoutes from './routes/preview';
import pagosRoutes from './routes/pagos';
import instagramRoutes from './routes/instagram';
import capturasRoutes from './routes/capturas';
import { procesarCola } from './lib/cola';

const app = express();
const PORT = process.env.PORT || 4000;

// Headers de seguridad (B-07): Protege contra XSS, clickjacking, MIME sniffing.
app.use(helmet());
app.disable('x-powered-by');

// Render y proxies invierten en X-Forwarded-For: sin esto el rate limit vería
// siempre la misma IP interna. Solo confiamos el primer salto (proxy directo).
app.set('trust proxy', 1);

// CORS: permitir solo la web (local y producción). Webhooks de terceros
// (MercadoPago) no envían Origin, por lo que no se ven afectados.
const origenesPermitidos = [
  process.env.WEB_APP_URL,
  'https://sorteos-mvp-gratuito-nine.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean) as string[];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origenesPermitidos.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origen no permitido por CORS'));
      }
    },
  })
);
app.use(express.json({ limit: '1mb' }));

// Rate limiting: protege la API de abusos (fuerza bruta, spam de sorteos).
// 100 solicitudes por IP cada 15 minutos es generoso para uso normal.
// RATE_LIMIT_LOW permite bajar el límite en tests (ej: 20) para validar el 429.
const RATE_LIMIT = parseInt(process.env.RATE_LIMIT || '100', 10);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: RATE_LIMIT,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Probá de nuevo en unos minutos.' },
});
app.use('/api', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/sorteos', sorteosRoutes);
app.use('/api/sorteos', previewRoutes);
app.use('/api/sorteos', instagramRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/capturas', capturasRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Middleware de errores global (B-06): No exponer stack traces ni detalles internos.
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Violación de CORS: el error llega sin status → responder 403 explícito.
  const esCORS = err.message && err.message.includes('Origen no permitido');
  const status = esCORS ? 403 : err.status || err.statusCode || 500;
  const message = esCORS
    ? 'Origen no permitido por CORS'
    : status === 500
      ? 'Error interno del servidor'
      : err.message || 'Error interno del servidor';
  res.status(status).json({ error: message });
});

// Job de la cola de espera: procesa solicitudes pendientes (FIFO) cuando
// hay cuota de sorteos gratis disponible. Corre cada 5 minutos.
const COLAR_INTERVALO_MS = 5 * 60 * 1000;
setInterval(() => {
  procesarCola()
    .then((n) => {
      if (n > 0) console.log(`Cola: ${n} solicitud(es) procesada(s)`);
    })
    .catch((e) => console.error('Cola: error en el job:', e));
}, COLAR_INTERVALO_MS);
procesarCola().catch((e) => console.error('Cola: error en el primer procesamiento:', e));

app.listen(PORT, () => {
  console.log(`API MVP corriendo en puerto ${PORT}`);
});