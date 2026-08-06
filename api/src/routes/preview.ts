import { Router, Request, Response } from 'express';
import { recolectarComentarios, parsearParticipantesManuales, RedSocialSoportada, Participante } from '../collectors';
import { extraerImagenPublicacion } from '../lib/preview';
import { construirCookiesCompletas } from '../lib/cookies';
import { sesionExiste } from './instagram';
import { CuotaAgotadaError, PRECIO_PASE_COLA } from '../lib/cuota';
import { PaseInvalidoError, validarPase } from '../lib/pases';
import { persistirCaptura } from '../lib/capturas';

const router = Router();

// Modelo de precios por cantidad de comentarios (misma lógica que routes/sorteos.ts)
function calcularPrecio(cantidadComentarios: number): number {
  if (cantidadComentarios <= 1000) return 0;
  if (cantidadComentarios <= 2000) return 5000;
  if (cantidadComentarios <= 3000) return 6000;
  if (cantidadComentarios <= 10000) return 10000;
  return 10000 + Math.ceil((cantidadComentarios - 10000) / 1000) * 1000;
}

// Filtra pares usuario|comentario repetidos (toggle "eliminar duplicados")
function deduplicarParticipantes(participantes: Participante[]): Participante[] {
  const mapa = new Map<string, Participante>();
  for (const p of participantes) {
    const clave = `${p.usuario.toLowerCase()}|${p.comentario}`;
    if (!mapa.has(clave)) mapa.set(clave, p);
  }
  return Array.from(mapa.values());
}

// Analiza una publicación sin crear sorteo: devuelve participantes, imagen y precio
router.post('/analizar', async (req: Request, res: Response) => {
  try {
    const { urlPublicacion, redSocial, participantesManuales, cookies, eliminarDuplicados, sessionId, paseAprobado, paseId } = req.body;

    const hayManuales = Array.isArray(participantesManuales) && participantesManuales.length > 0;
    const cookiesCompletas = construirCookiesCompletas(cookies, sessionId);

    // El Pase Rápido se valida contra la DB: si viene paseId y el flag, el pase debe
    // estar aprobado y sin usar para saltar la cuota (el frontend ya no puede fingirlo).
    const paseValido = paseId && paseAprobado === true;
    if (paseValido) {
      try {
        await validarPase(String(paseId));
      } catch (e) {
        if (e instanceof PaseInvalidoError) {
          res.status(402).json({ requierePago: true, motivo: 'pase_invalido', precio: PRECIO_PASE_COLA, moneda: 'ARS', mensaje: e.message });
          return;
        }
        throw e;
      }
    }

    // En modo manual la URL no es obligatoria
    if (!hayManuales && (!urlPublicacion || !redSocial)) {
      res.status(400).json({ error: 'Datos incompletos' });
      return;
    }

    const redSocialUsada: RedSocialSoportada = hayManuales ? (redSocial || 'instagram') : redSocial;
    const redSocialValida: RedSocialSoportada[] = ['instagram', 'tiktok', 'youtube'];
    if (!redSocialValida.includes(redSocialUsada)) {
      res.status(400).json({ error: 'Red social no soportada' });
      return;
    }

    // Si vienen participantes manuales, no hacer scraping
    let participantes: Participante[];
    if (hayManuales) {
      participantes = parsearParticipantesManuales(participantesManuales);
    } else {
      participantes = await recolectarComentarios(urlPublicacion, redSocialUsada, cookiesCompletas, eliminarDuplicados !== false, { paseAprobado: paseValido ? true : paseAprobado === true });
    }

    // Toggle "eliminar duplicados": ON (default) filtra pares repetidos
    if (eliminarDuplicados !== false) {
      participantes = deduplicarParticipantes(participantes);
    }

    const imagen = urlPublicacion ? await extraerImagenPublicacion(urlPublicacion, redSocialUsada) : null;
    const cantidadComentarios = participantes.length;
    const precio = calcularPrecio(cantidadComentarios);

    // Cómo se obtuvo la sesión (para mostrarlo en la UI)
    const sesion = hayManuales
      ? 'manual'
      : cookiesCompletas
        ? 'cookies'
        : sesionExiste()
          ? 'guardada'
          : 'anonima';

    // Guardar snapshot para comparar capturas futuras (p. ej. cuando el dueño
    // sortea con su sesión). Persistencia en DB (fuente de verdad) + disco local.
    await persistirCaptura({
      tipo: 'analizar',
      urlPublicacion,
      redSocial: redSocialUsada,
      sesion,
      cantidadComentarios,
      participantes,
    });

    res.json({
      cantidadComentarios,
      participantes,
      imagen,
      redSocial: redSocialUsada,
      sesion,
      requierePago: precio > 0,
      precio,
      moneda: 'ARS',
    });
  } catch (error: any) {
    if (error instanceof CuotaAgotadaError) {
      res.json({
        requierePago: true,
        motivo: 'cuota',
        precio: PRECIO_PASE_COLA,
        moneda: 'ARS',
        cantidadComentarios: 0,
        mensaje: `Se agotaron los sorteos gratuitos de la nube de hoy. Podés pagar el Pase Rápido ($${PRECIO_PASE_COLA} ARS) para analizar y sortear al instante, o entrar en la cola (gratis).`,
      });
      return;
    }
    console.error('Error analizando publicación:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

export default router;
