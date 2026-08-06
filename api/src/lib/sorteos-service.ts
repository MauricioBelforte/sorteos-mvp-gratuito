import prisma from './prisma';
import fs from 'fs';
import path from 'path';
import { realizarSorteo } from './verificacion';
import { recolectarComentarios, parsearParticipantesManuales, Participante, RedSocialSoportada } from '../collectors';
import { construirCookiesCompletas } from './cookies';
import { CuotaAgotadaError, PRECIO_PASE_COLA } from './cuota';
import { PaseInvalidoError, consumirPase, validarPase } from './pases';
import { persistirCaptura, describirSesion } from './capturas';

const SESSION_PATH_INDIRECTO = path.join(process.cwd(), '.instagram-session.json');

export interface SorteoInput {
  urlPublicacion: string;
  redSocial: string;
  cantidadGanadores: number;
  cantidadSuplentes?: number;
  participantesManuales?: string[];
  participantesPrecargados?: Participante[];
  cookies?: string;
  sessionId?: string;
  eliminarDuplicados?: boolean;
  paseAprobado?: boolean;
  paseId?: string;
}

export interface SorteoResultado {
  requierePago?: boolean;
  motivo?: 'volumen' | 'cuota' | 'pase_invalido';
  cantidadComentarios?: number;
  precio?: number;
  moneda?: string;
  mensaje?: string;
  sorteo?: any;
  comentarios?: Participante[];
}

// Modelo de precios por cantidad de comentarios
export function calcularPrecio(cantidadComentarios: number): number {
  if (cantidadComentarios <= 1000) return 0;
  if (cantidadComentarios <= 2000) return 5000;
  if (cantidadComentarios <= 3000) return 6000;
  if (cantidadComentarios <= 10000) return 10000;
  return 10000 + Math.ceil((cantidadComentarios - 10000) / 1000) * 1000;
}

// Filtra pares usuario|comentario repetidos (toggle "eliminar duplicados")
export function deduplicarParticipantes(participantes: Participante[]): Participante[] {
  const mapa = new Map<string, Participante>();
  for (const p of participantes) {
    const clave = `${p.usuario.toLowerCase()}|${p.comentario}`;
    if (!mapa.has(clave)) mapa.set(clave, p);
  }
  return Array.from(mapa.values());
}

// Orquesta un sorteo completo: recolección → precio → persistencia → sorteo.
// Es reutilizado por la ruta POST /api/sorteos y por el job de la cola.
// Puede lanzar CuotaAgotadaError (se propaga desde la estrategia Apify) o
// devolver requierePago para el pago por volumen o por cuota.
export async function ejecutarSorteoCompleto(input: SorteoInput): Promise<SorteoResultado> {
  const { urlPublicacion, redSocial, cantidadGanadores, eliminarDuplicados } = input;
  const cookiesCompletas = construirCookiesCompletas(input.cookies, input.sessionId);

  // Pase Rápido: validar contra la DB ANTES de recolectar. Si el pase llegó aprobado,
  // habilita la estrategia Apify sin cuota (el frontend no puede fingirlo vía flag).
  const paseValido = Boolean(input.paseId && input.paseAprobado === true);
  if (paseValido) {
    await validarPase(input.paseId);
  }

  // Recolectar comentarios primero para calcular precio (o usar lista manual/precargada)
  let comentarios: Participante[];
  if (Array.isArray(input.participantesManuales) && input.participantesManuales.length > 0) {
    comentarios = parsearParticipantesManuales(input.participantesManuales);
  } else if (Array.isArray(input.participantesPrecargados) && input.participantesPrecargados.length > 0) {
    // El front ya recolectó en /analizar: reutilizar para NO abrir Chrome dos veces
    comentarios = input.participantesPrecargados
      .filter((p: any) => typeof p?.usuario === 'string' && typeof p?.comentario === 'string')
      .map((p: any) => ({ usuario: p.usuario, comentario: p.comentario }));
    console.log(`Sorteo: usando ${comentarios.length} participantes precargados del análisis`);
  } else {
    if (!urlPublicacion || !redSocial) {
      throw new Error('Datos incompletos');
    }
    comentarios = await recolectarComentarios(urlPublicacion, redSocial as RedSocialSoportada, cookiesCompletas, eliminarDuplicados !== false, {
      paseAprobado: paseValido ? true : input.paseAprobado === true,
    });
  }

  // Toggle "eliminar duplicados": ON (default) filtra pares repetidos
  if (eliminarDuplicados !== false) {
    comentarios = deduplicarParticipantes(comentarios);
  }

  if (comentarios.length === 0) {
    throw new Error('No se encontraron participantes para realizar el sorteo. Probá con otra publicación o pegá los comentarios manualmente.');
  }

  const cantidadComentarios = comentarios.length;
  const precio = calcularPrecio(cantidadComentarios);

  // Si hay costo por volumen, requerir pago antes de crear sorteo
  if (precio > 0) {
    return {
      requierePago: true,
      motivo: 'volumen',
      cantidadComentarios,
      precio,
      moneda: 'ARS',
      mensaje: `Este sorteo tiene ${cantidadComentarios} comentarios. El costo es de $${precio} ARS.`,
    };
  }

  // Limitar ganadores y suplentes a la cantidad de participantes disponibles
  const cantidadGanadoresFinal = Math.max(1, Math.min(cantidadGanadores, comentarios.length));
  const cantidadSuplentesFinal = Math.max(0, Math.min(input.cantidadSuplentes || 0, comentarios.length - cantidadGanadoresFinal));

  // Crear sorteo sin usuario (auth opcional)
  const sorteo = await prisma.sorteo.create({
    data: {
      titulo: `Sorteo de ${redSocial || 'publicación'}`,
      urlPublicacion,
      redSocial,
      cantidadGanadores: cantidadGanadoresFinal,
      cantidadSuplentes: cantidadSuplentesFinal,
      usuarioId: null, // Sin usuario para MVP sin auth
      estado: 'pendiente',
    },
  });

  const usernames = comentarios.map((c) => c.usuario);

  // Guardar participantes (SQLite no soporta skipDuplicates, usar try/catch)
  for (const participante of comentarios) {
    try {
      await prisma.participante.create({
        data: {
          usuarioExterno: participante.usuario,
          comentario: participante.comentario,
          sorteoId: sorteo.id,
        },
      });
    } catch (e) {
      // Ignorar duplicados
    }
  }

  // Guardar snapshot del dataset real usado en el sorteo, para comparar en el
  // futuro (p. ej. dueño con sesión vs nuestro scrape anónimo del mismo post).
  await persistirCaptura({
    tipo: 'sorteo',
    urlPublicacion,
    redSocial,
    sesion: describirSesion(
      Array.isArray(input.participantesManuales) && input.participantesManuales.length > 0,
      Boolean(cookiesCompletas),
      fs.existsSync(SESSION_PATH_INDIRECTO)
    ),
    cantidadComentarios: comentarios.length,
    participantes: comentarios,
  });

  // Realizar sorteo
  const resultado = realizarSorteo(usernames, cantidadGanadoresFinal, cantidadSuplentesFinal);

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

  // Consumir el Pase Rápido: queda ligado a ESTE sorteo (un pase = un sorteo)
  if (paseValido && input.paseId) {
    await consumirPase(input.paseId, sorteo.id);
  }

  return {
    sorteo: {
      id: sorteo.id,
      titulo: sorteo.titulo,
      estado: sorteo.estado,
      ganadores: resultado.ganadores,
      suplentes: resultado.suplentes,
      hashVerificacion: resultado.hashVerificacion,
    },
    comentarios,
  };
}

// Convierte un CuotaAgotadaError en la respuesta 402 estándar con la oferta
// de pase rápido o cola.
export function respuestaCuotaAgotada(): SorteoResultado {
  return {
    requierePago: true,
    motivo: 'cuota',
    precio: PRECIO_PASE_COLA,
    moneda: 'ARS',
    mensaje: `Se agotaron los sorteos gratuitos de la nube de hoy. Podés pagar el Pase Rápido ($${PRECIO_PASE_COLA} ARS) para sortear al instante, o entrar en la cola (gratis) y te lo procesamos cuando se libere cuota.`,
  };
}

export { CuotaAgotadaError };
