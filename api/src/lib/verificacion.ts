import { createHash } from "crypto";

/**
 * Genera un hash SHA-256 de la lista de participantes ordenada
 */
export function generarHashParticipantes(participantes: string[]): string {
  const ordenada = [...participantes].sort();
  const input = ordenada.join("|");
  return createHash("sha256").update(input).digest("hex");
}

/**
 * Genera el hash de verificación completo (participantes + timestamp)
 */
export function generarHashVerificacion(
  participantes: string[],
  timestamp: string
): string {
  const participantesHash = generarHashParticipantes(participantes);
  const input = `${participantesHash}|${timestamp}`;
  return createHash("sha256").update(input).digest("hex");
}

/**
 * PRNG determinístico basado en una semilla
 */
function crearPRNG(seed: string) {
  let num = 0;
  for (let i = 0; i < seed.length; i++) {
    num = (num * 31 + seed.charCodeAt(i)) % 2147483647;
  }
  if (num === 0) num = 1;

  return {
    next(): number {
      num = (num * 16807) % 2147483647;
      return (num - 1) / 2147483646;
    },
  };
}

/**
 * Selecciona N elementos de un array sin repetición usando un PRNG determinístico
 */
function seleccionarSinRepeticion<T>(arr: T[], cantidad: number, prng: { next(): number }): T[] {
  const disponibles = [...arr];
  const seleccionados: T[] = [];

  // El límite se calcula UNA vez: usar disponibles.length en la condición haría
  // que cada splice encogiera el límite y devolviera menos ganadores de los pedidos.
  const total = Math.min(cantidad, disponibles.length);
  for (let i = 0; i < total; i++) {
    const idx = Math.floor(prng.next() * disponibles.length);
    seleccionados.push(disponibles[idx]);
    disponibles.splice(idx, 1);
  }

  return seleccionados;
}

export interface ResultadoSorteo {
  ganadores: string[];
  suplentes: string[];
  hashVerificacion: string;
  participantesHash: string;
  timestamp: string;
}

/**
 * Realiza el sorteo completo de forma determinística y verificable
 */
export function realizarSorteo(
  participantes: string[],
  cantidadGanadores: number,
  cantidadSuplentes: number
): ResultadoSorteo {
  const unicos = [...new Set(participantes)];

  if (unicos.length === 0) {
    throw new Error("No hay participantes para realizar el sorteo");
  }

  const timestamp = new Date().toISOString();
  const hashVerificacion = generarHashVerificacion(unicos, timestamp);
  const participantesHash = generarHashParticipantes(unicos);

  const prng = crearPRNG(hashVerificacion);
  const ganadores = seleccionarSinRepeticion(unicos, cantidadGanadores, prng);

  const restantes = unicos.filter((p) => !ganadores.includes(p));
  const suplentes = seleccionarSinRepeticion(restantes, cantidadSuplentes, prng);

  return {
    ganadores,
    suplentes,
    hashVerificacion,
    participantesHash,
    timestamp,
  };
}

/**
 * Verifica que un resultado de sorteo sea válido
 */
export function verificarSorteo(
  participantes: string[],
  timestamp: string,
  hashVerificacionEsperado: string
): boolean {
  const hashCalculado = generarHashVerificacion(participantes, timestamp);
  return hashCalculado === hashVerificacionEsperado;
}
