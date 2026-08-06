import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { ejecutarSorteoCompleto, respuestaCuotaAgotada, SorteoInput } from '../lib/sorteos-service';
import { estadoCuota, PRECIO_PASE_COLA, CuotaAgotadaError } from '../lib/cuota';
import { entrarEnCola, estadoCola } from '../lib/cola';
import { PaseInvalidoError } from '../lib/pases';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body as SorteoInput;

    if (!body.cantidadGanadores) {
      res.status(400).json({ error: 'Datos incompletos' });
      return;
    }

    const resultado = await ejecutarSorteoCompleto({
      urlPublicacion: body.urlPublicacion,
      redSocial: body.redSocial,
      cantidadGanadores: body.cantidadGanadores,
      cantidadSuplentes: body.cantidadSuplentes,
      participantesManuales: body.participantesManuales,
      participantesPrecargados: body.participantesPrecargados,
      cookies: body.cookies,
      sessionId: body.sessionId,
      eliminarDuplicados: body.eliminarDuplicados,
      paseAprobado: body.paseAprobado,
      paseId: body.paseId,
    });

    if (resultado.requierePago) {
      res.json(resultado);
      return;
    }

    res.json({ sorteo: resultado.sorteo, comentarios: resultado.comentarios });
  } catch (error: any) {
    if (error instanceof CuotaAgotadaError) {
      res.json(respuestaCuotaAgotada());
      return;
    }
    if (error instanceof PaseInvalidoError) {
      res.status(402).json({ requierePago: true, motivo: 'pase_invalido', precio: PRECIO_PASE_COLA, moneda: 'ARS', mensaje: error.message });
      return;
    }
    console.error('Error creando sorteo:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

// Estado de la cuota de sorteos gratis de la nube (para mostrar en la UI)
router.get('/cuota', async (req: Request, res: Response) => {
  try {
    const cuota = await estadoCuota();
    res.json({ ...cuota, precioPase: PRECIO_PASE_COLA });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

// Entrar en la cola de espera cuando la cuota del día está agotada
router.post('/cola', async (req: Request, res: Response) => {
  try {
    const { urlPublicacion, redSocial, cantidadGanadores, cantidadSuplentes, eliminarDuplicados } = req.body;
    if (!urlPublicacion || !redSocial || !cantidadGanadores) {
      res.status(400).json({ error: 'Datos incompletos' });
      return;
    }
    const solicitud = await entrarEnCola({
      urlPublicacion,
      redSocial,
      cantidadGanadores,
      cantidadSuplentes,
      eliminarDuplicados,
    });
    const estado = await estadoCola(solicitud.id);
    res.json(estado);
  } catch (error: any) {
    console.error('Error entrando en cola:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

// Estado de una solicitud en cola (polling del frontend)
router.get('/cola/:id', async (req: Request, res: Response) => {
  try {
    const estado = await estadoCola(req.params.id);
    if (!estado) {
      res.status(404).json({ error: 'Solicitud no encontrada' });
      return;
    }
    res.json(estado);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    // MVP sin auth: listar todos los sorteos recientes (últimos 50)
    const sorteos = await prisma.sorteo.findMany({
      where: { usuarioId: 'anonimo' },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        certificados: true,
      },
    });
    
    res.json(sorteos);
  } catch (error: any) {
    console.error('Error listando sorteos:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const sorteo = await prisma.sorteo.findUnique({
      where: { id: req.params.id },
      include: {
        certificados: true,
      },
    });
    
    if (!sorteo) {
      res.status(404).json({ error: 'Sorteo no encontrado' });
      return;
    }
    
    res.json(sorteo);
  } catch (error: any) {
    console.error('Error obteniendo sorteo:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

export default router;
