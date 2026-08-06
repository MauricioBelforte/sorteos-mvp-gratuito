import prisma from './prisma';
import { cuotaDisponibleHoy, estadoCuota, cuotaConfigurada, CuotaAgotadaError } from './cuota';
import { ejecutarSorteoCompleto, SorteoInput } from './sorteos-service';

export interface SolicitudColaInput {
  urlPublicacion: string;
  redSocial: string;
  cantidadGanadores: number;
  cantidadSuplentes?: number;
  eliminarDuplicados?: boolean;
}

// Estima cuándo habrá un slot disponible: la cuota se recalcula cada día
// (restantes / días restantes), así que el próximo slot es mañana 00:00
// (o el mismo día si quedara cuota del día sin usar).
export async function estimarProximoSlot(): Promise<Date> {
  const e = await estadoCuota();
  if (!cuotaConfigurada() || e.restantes <= 0) {
    // Crédito del mes agotado por completo: espera al 1ro del próximo mes
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0);
  }
  // Quedan restantes en el mes: el recálculo diario libera un slot mañana
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function entrarEnCola(input: SolicitudColaInput) {
  const pendientes = await prisma.solicitudCola.count({
    where: { estado: { in: ['pendiente', 'procesando'] } },
  });
  const solicitud = await prisma.solicitudCola.create({
    data: {
      urlPublicacion: input.urlPublicacion,
      redSocial: input.redSocial,
      cantidadGanadores: Math.max(1, input.cantidadGanadores || 1),
      cantidadSuplentes: Math.max(0, input.cantidadSuplentes || 0),
      eliminarDuplicados: input.eliminarDuplicados !== false,
      posicion: pendientes + 1,
    },
  });
  return solicitud;
}

export async function estadoCola(solicitudId: string) {
  const solicitud = await prisma.solicitudCola.findUnique({ where: { id: solicitudId } });
  if (!solicitud) return null;

  const porDelante = await prisma.solicitudCola.count({
    where: {
      estado: { in: ['pendiente', 'procesando'] },
      createdAt: { lt: solicitud.createdAt },
    },
  });

  let disponibleEn: Date | null = null;
  if (solicitud.estado === 'pendiente') {
    disponibleEn = await estimarProximoSlot();
  }

  return {
    id: solicitud.id,
    estado: solicitud.estado,
    posicion: solicitud.estado === 'pendiente' ? porDelante + 1 : 0,
    disponibleEn,
    sorteoId: solicitud.sorteoId,
    resultado: solicitud.resultado ? JSON.parse(solicitud.resultado) : null,
    error: solicitud.error,
    createdAt: solicitud.createdAt,
  };
}

// Job periódico: procesa la cola FIFO mientras haya cuota disponible hoy.
// Cada solicitud se convierte en un sorteo completo (recolección + sorteo)
// usando la cuota (sin pase). Si la cuota se agota, se detiene.
export async function procesarCola(): Promise<number> {
  const pendientes = await prisma.solicitudCola.findMany({
    where: { estado: 'pendiente' },
    orderBy: { createdAt: 'asc' },
  });
  if (pendientes.length === 0) return 0;

  let procesados = 0;
  for (const solicitud of pendientes) {
    if (!(await cuotaDisponibleHoy())) {
      console.log(`Cola: cuota del día agotada, quedan ${pendientes.length - procesados} solicitudes pendientes`);
      break;
    }

    await prisma.solicitudCola.update({ where: { id: solicitud.id }, data: { estado: 'procesando' } });
    try {
      const input: SorteoInput = {
        urlPublicacion: solicitud.urlPublicacion,
        redSocial: solicitud.redSocial,
        cantidadGanadores: solicitud.cantidadGanadores,
        cantidadSuplentes: solicitud.cantidadSuplentes,
        eliminarDuplicados: solicitud.eliminarDuplicados,
      };
      const resultado = await ejecutarSorteoCompleto(input);
      if (resultado.requierePago) {
        throw new Error('Sorteo en cola requirió pago (precio por volumen)');
      }
      await prisma.solicitudCola.update({
        where: { id: solicitud.id },
        data: {
          estado: 'completado',
          sorteoId: resultado.sorteo!.id,
          resultado: JSON.stringify(resultado),
          procesadoAt: new Date(),
          posicion: 0,
        },
      });
      procesados++;
    } catch (e) {
      if (e instanceof CuotaAgotadaError) {
        await prisma.solicitudCola.update({
          where: { id: solicitud.id },
          data: { estado: 'pendiente', error: null },
        });
        break;
      }
      await prisma.solicitudCola.update({
        where: { id: solicitud.id },
        data: { estado: 'fallido', error: (e as Error).message, procesadoAt: new Date() },
      });
    }
  }
  return procesados;
}
