import { Router, Request, Response } from 'express';
import { MercadoPagoClient, createPayment, verifyWebhookSignature } from '@shared/mercadopago';
import { PRECIO_PASE_COLA } from '../lib/cuota';
import {
  aprobarPase,
  crearPase,
  estadoPase,
  guardarPreferenciaMp,
  rechazarPase,
} from '../lib/pases';

const router = Router();

const WEB_APP_URL = process.env.WEB_APP_URL || 'http://localhost:3000';
// URL pública del API para los webhooks. En local solo sirve para configurar
// notification_url; MP necesita una URL HTTPS accesible en producción.
const API_WEBHOOK_URL =
  process.env.MERCADO_PAGO_NOTIFICATION_URL ||
  (process.env.API_BASE_URL ? `${process.env.API_BASE_URL}/api/pagos/webhook` : undefined);

/**
 * Crea la preferencia de pago del Pase Rápido en MercadoPago.
 * El pase queda 'pendiente' hasta que el pago se aprueba (webhook o verificación).
 */
router.post('/pase', async (_req: Request, res: Response) => {
  try {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      res.status(500).json({ error: 'MercadoPago no configurado (MERCADO_PAGO_ACCESS_TOKEN)' });
      return;
    }

    const pase = await crearPase();

    const payment = await createPayment(
      {
        accessToken,
        webhookSecret: process.env.MERCADO_PAGO_WEBHOOK_SECRET,
      },
      {
        title: 'Pase Rápido - Sorteosypromos',
        description: 'Salta la cola y sortea al instante cuando se agota la cuota gratuita',
        price: pase.monto,
        currency: 'ARS',
        externalReference: pase.id,
        successUrl: `${WEB_APP_URL}/pago?estado=success&paseId=${pase.id}`,
        failureUrl: `${WEB_APP_URL}/pago?estado=failure&paseId=${pase.id}`,
        pendingUrl: `${WEB_APP_URL}/pago?estado=pending&paseId=${pase.id}`,
        ...(API_WEBHOOK_URL ? { notificationUrl: API_WEBHOOK_URL } : {}),
      }
    );

    await guardarPreferenciaMp(pase.id, payment.id);

    res.json({
      paseId: pase.id,
      monto: pase.monto,
      moneda: 'ARS',
      initPoint: payment.init_point,
      sandboxInitPoint: payment.sandbox_init_point,
    });
  } catch (error: any) {
    console.error('[pagos] Error creando preferencia del Pase:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

/**
 * Estado del Pase Rápido. El frontend lo consulta al volver de MercadoPago
 * (y puede reintentar contra MP para refrescar el estado si el pago demoró).
 */
router.get('/pase/:id', async (req: Request, res: Response) => {
  try {
    const pase = await estadoPase(req.params.id);
    if (!pase) {
      res.status(404).json({ error: 'Pase no encontrado' });
      return;
    }
    res.json({
      paseId: pase.id,
      estado: pase.estado,
      monto: pase.monto,
      moneda: pase.moneda,
      usadoEnSorteoId: pase.usadoEnSorteoId,
      pagadoAt: pase.pagadoAt,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

/**
 * Webhook de MercadoPago. Se usa como disparador: se consulta a la API de MP
 * por el payment_id (fuente de verdad) y, si está aprobado, se marca el pase.
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;

    // Validar la firma de MP si hay secret configurado (recomendado).
    // MP firma el manifest `id:...;request-id:...;ts:...;` (ver shared-modules).
    if (webhookSecret) {
      const xSignature = req.headers['x-signature'] as string | undefined;
      const xRequestId = req.headers['x-request-id'] as string | undefined;
      const dataIdQuery = req.query['data.id'] as string | undefined;
      const dataIdBody = String(req.body?.data?.id || '');
      const dataId = dataIdQuery || dataIdBody;
      if (!xSignature || !verifyWebhookSignature(xSignature, xRequestId, dataId, webhookSecret)) {
        console.warn('[pagos] Webhook rechazado: firma inválida');
        res.status(401).json({ error: 'Firma inválida' });
        return;
      }
    }

    const { type, data } = req.body ?? {};
    if (type === 'payment' && data?.id && accessToken) {
      const client = new MercadoPagoClient({ accessToken });
      const payment = await client.getPayment(Number(data.id));
      console.log(`[pagos] Webhook payment ${data.id} -> status ${payment?.status} (external_reference ${payment?.external_reference})`);
      if (payment?.status === 'approved' && payment.external_reference) {
        await aprobarPase(payment.external_reference, String(data.id));
      } else if (payment?.status && payment.external_reference) {
        await rechazarPase(payment.external_reference);
      }
    }

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('[pagos] Error en webhook:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

/** Ruta de verificación manual: consulta MP y actualiza el pase (usada en el retorno del checkout). */
router.post('/verificar', async (req: Request, res: Response) => {
  try {
    const { paseId, paymentId } = req.body ?? {};
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!paseId || !paymentId || !accessToken) {
      res.status(400).json({ error: 'paseId y paymentId requeridos (o MP no configurado)' });
      return;
    }

    const client = new MercadoPagoClient({ accessToken });
    const payment = await client.getPayment(Number(paymentId));
    const pase = await estadoPase(String(paseId));

    if (payment?.status === 'approved' && payment.external_reference === paseId) {
      const paseAprobado = await aprobarPase(String(paseId), String(paymentId));
      res.json({
        paseId: paseAprobado?.id,
        estado: paseAprobado?.estado,
        monto: paseAprobado?.monto,
        pagoMpStatus: payment?.status,
      });
      return;
    }

    res.json({
      paseId: pase?.id,
      estado: pase?.estado,
      monto: pase?.monto,
      pagoMpStatus: payment?.status,
    });
  } catch (error: any) {
    console.error('[pagos] Error verificando pago:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

export default router;