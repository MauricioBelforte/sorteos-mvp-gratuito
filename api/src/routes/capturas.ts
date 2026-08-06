import { Router, Request, Response } from 'express';
import { listarCapturas } from '../lib/capturas';

const router = Router();

// Lista capturas guardadas para revisión (filtros opcionales por shortcode/tipo).
// Pensado para el dueño del sistema: ver qué capturaron los usuarios y comparar.
router.get('/', async (req: Request, res: Response) => {
  try {
    const { shortcode, tipo } = req.query;
    const capturas = await listarCapturas({
      ...(typeof shortcode === 'string' ? { shortcode } : {}),
      ...(typeof tipo === 'string' ? { tipo } : {}),
    });
    res.json({
      cantidad: capturas.length,
      capturas: capturas.map((c) => ({
        id: c.id,
        tipo: c.tipo,
        urlPublicacion: c.urlPublicacion,
        shortcode: c.shortcode,
        redSocial: c.redSocial,
        sesion: c.sesion,
        cantidadComentarios: c.cantidadComentarios,
        guardadoEn: c.guardadoEn,
      })),
    });
  } catch (error: any) {
    console.error('Error listando capturas:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

export default router;