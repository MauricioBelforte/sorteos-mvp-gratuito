import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import sorteosRoutes from './routes/sorteos';
import previewRoutes from './routes/preview';
import pagosRoutes from './routes/pagos';
import instagramRoutes from './routes/instagram';
import capturasRoutes from './routes/capturas';
import { procesarCola } from './lib/cola';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/sorteos', sorteosRoutes);
app.use('/api/sorteos', previewRoutes);
app.use('/api/sorteos', instagramRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/capturas', capturasRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
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
