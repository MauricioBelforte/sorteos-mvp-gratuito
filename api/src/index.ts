import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import sorteosRoutes from './routes/sorteos';
import pagosRoutes from './routes/pagos';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/sorteos', sorteosRoutes);
app.use('/api/pagos', pagosRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`API MVP corriendo en puerto ${PORT}`);
});
