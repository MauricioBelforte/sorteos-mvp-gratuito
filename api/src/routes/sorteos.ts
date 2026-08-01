import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { realizarSorteo } from '../lib/verificacion';
import { recolectarComentarios } from '../collectors';
import { AuthRequest } from '../lib/middleware';
import { authMiddleware } from '../lib/middleware';

const router = Router();

// Límite de 3 sorteos por mes para plan free
const LIMITE_SORTEOS_MENSUAL = 3;

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { titulo, urlPublicacion, redSocial, cantidadGanadores, cantidadSuplentes } = req.body;
    
    if (!titulo || !urlPublicacion || !redSocial || !cantidadGanadores) {
      res.status(400).json({ error: 'Datos incompletos' });
      return;
    }
    
    // Verificar límite mensual
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);
    
    const sorteosEsteMes = await prisma.sorteo.count({
      where: {
        usuarioId: req.userId!,
        createdAt: { gte: inicioMes },
      },
    });
    
    if (sorteosEsteMes >= LIMITE_SORTEOS_MENSUAL) {
      res.status(400).json({ error: `Límite de ${LIMITE_SORTEOS_MENSUAL} sorteos por mes alcanzado` });
      return;
    }
    
    // Crear sorteo en estado pendiente
    const sorteo = await prisma.sorteo.create({
      data: {
        titulo,
        urlPublicacion,
        redSocial,
        cantidadGanadores,
        cantidadSuplentes: cantidadSuplentes || 0,
        usuarioId: req.userId!,
        estado: 'pendiente',
      },
    });
    
    // Recolectar comentarios
    const comentarios = await recolectarComentarios(urlPublicacion, redSocial);
    
    // Guardar participantes (SQLite no soporta skipDuplicates, usar try/catch)
    for (const usuarioExterno of comentarios) {
      try {
        await prisma.participante.create({
          data: {
            usuarioExterno,
            sorteoId: sorteo.id,
          },
        });
      } catch (e) {
        // Ignorar duplicados
      }
    }
    
    // Realizar sorteo
    const resultado = realizarSorteo(comentarios, cantidadGanadores, cantidadSuplentes);
    
    // Actualizar sorteo con resultado
    await prisma.sorteo.update({
      where: { id: sorteo.id },
      data: {
        estado: 'completado',
        hashVerificacion: resultado.hashVerificacion,
        timestamp: resultado.timestamp,
        participantesHash: resultado.participantesHash,
      },
    });
    
    // Crear certificado
    await prisma.certificado.create({
      data: {
        sorteoId: sorteo.id,
        ganadores: JSON.stringify(resultado.ganadores),
        suplentes: JSON.stringify(resultado.suplentes),
      },
    });
    
    res.json({
      sorteo: {
        id: sorteo.id,
        titulo: sorteo.titulo,
        estado: sorteo.estado,
        ganadores: resultado.ganadores,
        suplentes: resultado.suplentes,
        hashVerificacion: resultado.hashVerificacion,
      },
    });
  } catch (error: any) {
    console.error('Error creando sorteo:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const sorteos = await prisma.sorteo.findMany({
      where: { usuarioId: req.userId! },
      orderBy: { createdAt: 'desc' },
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
