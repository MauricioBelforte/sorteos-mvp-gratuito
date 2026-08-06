import prisma from './prisma';
import { PRECIO_PASE_COLA } from './cuota';

export class PaseInvalidoError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'PaseInvalidoError';
  }
}

export interface PaseInfo {
  id: string;
  monto: number;
  moneda: string;
  estado: string;
  usadoEnSorteoId: string | null;
  pagadoAt: Date | null;
}

export async function crearPase(): Promise<PaseInfo> {
  const pase = await prisma.pagoPase.create({
    data: { monto: PRECIO_PASE_COLA },
  });
  return pase;
}

export async function guardarPreferenciaMp(paseId: string, preferenciaId: string) {
  return prisma.pagoPase.update({
    where: { id: paseId },
    data: { preferenciaId },
  });
}

export async function aprobarPase(paseId: string, pagoMpId: string): Promise<PaseInfo | null> {
  return prisma.pagoPase.update({
    where: { id: paseId },
    data: { estado: 'aprobado', pagoMpId, pagadoAt: new Date() },
  });
}

export async function rechazarPase(paseId: string): Promise<PaseInfo | null> {
  return prisma.pagoPase.update({
    where: { id: paseId },
    data: { estado: 'rechazado' },
  });
}

export async function estadoPase(paseId: string): Promise<PaseInfo | null> {
  return prisma.pagoPase.findUnique({ where: { id: paseId } });
}

/**
 * Valida que un pase exista, esté aprobado y no haya sido usado aún.
 * No lo consume: el consumo (usadoEnSorteoId) lo hace el sorteo al crearse.
 */
export async function validarPase(paseId?: string | null): Promise<PaseInfo> {
  if (!paseId) {
    throw new PaseInvalidoError('Pase Rápido no indicado');
  }
  const pase = await estadoPase(paseId);
  if (!pase) {
    throw new PaseInvalidoError('Pase Rápido no encontrado');
  }
  if (pase.estado !== 'aprobado') {
    throw new PaseInvalidoError('El Pase Rápido todavía no fue aprobado');
  }
  if (pase.usadoEnSorteoId) {
    throw new PaseInvalidoError('Este Pase Rápido ya fue utilizado en otro sorteo');
  }
  return pase;
}

export async function consumirPase(paseId: string, sorteoId: string) {
  return prisma.pagoPase.update({
    where: { id: paseId },
    data: { usadoEnSorteoId: sorteoId },
  });
}
