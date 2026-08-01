import { Router, Request, Response } from 'express';
import { createUsagePayment, verifyWebhookSignature } from '@shared/mercadopago';
import prisma from '../lib/prisma';
import { AuthRequest } from '../lib/middleware';
import { authMiddleware } from '../lib/middleware';

const router = Router();

// Configuración de pago por uso
const PRECIO_POR_SORTEO = 100; // 100 ARS por sorteo

/**
 * Crea un pago por sorteo
 */
router.post('/checkout', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { sorteoId } = req.body;

    if (!sorteoId) {
      res.status(400).json({ error: 'sorteoId requerido' });
      return;
    }

    // Verificar que el sorteo existe y pertenece al usuario
    const sorteo = await prisma.sorteo.findUnique({
      where: { id: sorteoId },
    });

    if (!sorteo) {
      res.status(404).json({ error: 'Sorteo no encontrado' });
      return;
    }

    if (sorteo.usuarioId !== req.userId) {
      res.status(403).json({ error: 'No tienes permiso para pagar este sorteo' });
      return;
    }

    // Crear pago por uso
    const payment = await createUsagePayment(
      {
        accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
        webhookSecret: process.env.MERCADO_PAGO_WEBHOOK_SECRET,
      },
      {
        pricePerRaffle: PRECIO_POR_SORTEO,
        currency: 'ARS',
        description: `Pago por sorteo: ${sorteo.titulo}`,
      },
      sorteoId
    );

    res.json({
      checkoutUrl: payment.init_point,
      sandboxCheckoutUrl: payment.sandbox_init_point,
      preferenceId: payment.id,
    });
  } catch (error: any) {
    console.error('Error creando pago:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

/**
 * Webhook de Mercado Pago
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-signature'] as string;
    const payload = JSON.stringify(req.body);

    // Verificar firma del webhook
    if (signature && process.env.MERCADO_PAGO_WEBHOOK_SECRET) {
      const isValid = verifyWebhookSignature(
        signature,
        payload,
        process.env.MERCADO_PAGO_WEBHOOK_SECRET
      );

      if (!isValid) {
        res.status(401).json({ error: 'Firma inválida' });
        return;
      }
    }

    const { type, data } = req.body;

    if (type === 'payment' && data?.id) {
      // Obtener detalles del pago
      const paymentId = data.id;
      
      // Aquí podrías usar el cliente de Mercado Pago para obtener más detalles
      // Por ahora, asumimos que el pago fue exitoso si llegamos aquí
      
      // Actualizar el sorteo como pagado (implementar lógica según necesidades)
      console.log(`Pago recibido: ${paymentId}`);
    }

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Error en webhook:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

export default router;
