import prisma from './prisma';

// Cuota de sorteos gratis de la nube: cada sorteo anónimo del servidor puede
// costar ~$0.11 USD (actor de Apify). El plan gratuito renueva $5/mes
// (~45 sorteos). Se limita con cuota dinámica diaria: restantes / días
// restantes del mes (redondeando hacia arriba para gastar el 100% del crédito).
// APIFY_CUOTA_MENSUAL = 0 desactiva el límite (todo gratis, uso actual local).
export const CUOTA_MENSUAL = Number(process.env.APIFY_CUOTA_MENSUAL ?? 45);
export const PRECIO_PASE_COLA = Number(process.env.PRECIO_PASE_COLA ?? 2500);

// Se lanza en el punto EXACTO del gasto (estrategia Apify) y se propaga hasta
// la ruta para responder 402 con la oferta de pase/cola.
export class CuotaAgotadaError extends Error {
  constructor() {
    super('Cuota de sorteos gratis de la nube agotada');
    this.name = 'CuotaAgotadaError';
  }
}

export function cuotaConfigurada(): boolean {
  return CUOTA_MENSUAL > 0;
}

export function mesActual(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function diasRestantesMes(): number {
  const d = new Date();
  const ultimoDia = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return ultimoDia - d.getDate() + 1;
}

export async function usosDelMes(): Promise<number> {
  const reg = await prisma.cuotaApify.findUnique({ where: { mes: mesActual() } });
  return reg?.usos ?? 0;
}

export async function estadoCuota() {
  const usos = await usosDelMes();
  const restantes = Math.max(0, CUOTA_MENSUAL - usos);
  const dias = diasRestantesMes();
  const cuotaHoy = restantes === 0 ? 0 : Math.ceil(restantes / dias);
  return { cuotaMensual: CUOTA_MENSUAL, usosMes: usos, restantes, diasRestantes: dias, cuotaHoy };
}

export async function cuotaDisponibleHoy(): Promise<boolean> {
  if (!cuotaConfigurada()) return true;
  const e = await estadoCuota();
  return e.cuotaHoy > 0;
}

// Solo se llama cuando Apify se EJECUTA de verdad (gasto real del actor).
export async function registrarUsoApify(): Promise<void> {
  const mes = mesActual();
  await prisma.cuotaApify.upsert({
    where: { mes },
    create: { mes, usos: 1 },
    update: { usos: { increment: 1 } },
  });
}
