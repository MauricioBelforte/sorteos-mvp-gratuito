const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Participante {
  usuario: string;
  comentario: string;
}

export const REDES_SOCIALES = [
  { id: 'instagram', nombre: 'Instagram', dominio: 'instagram.com', color: 'text-pink-500', gradiente: 'from-pink-500 to-rose-600' },
  { id: 'tiktok', nombre: 'TikTok', dominio: 'tiktok.com', color: 'text-cyan-400', gradiente: 'from-cyan-400 to-blue-600' },
  { id: 'youtube', nombre: 'YouTube', dominio: 'youtube.com', color: 'text-red-500', gradiente: 'from-red-500 to-rose-600' },
];

export function detectarRedSocial(url: string): string {
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  return '';
}

export function getRedInfo(redSocial: string) {
  return REDES_SOCIALES.find((r) => r.id === redSocial);
}

// Filtra pares usuario|comentario repetidos (misma lógica que el backend:
// `api/src/lib/sorteos-service.ts` -> deduplicarParticipantes). Se usa en el
// frontend para alternar el toggle sin volver a scrapear la publicación.
export function deduplicarParticipantes(participantes: Participante[]): Participante[] {
  const mapa = new Map<string, Participante>();
  for (const p of participantes) {
    if (typeof p?.usuario !== 'string' || typeof p?.comentario !== 'string') continue;
    const clave = `${p.usuario.toLowerCase()}|${p.comentario}`;
    if (!mapa.has(clave)) mapa.set(clave, p);
  }
  return Array.from(mapa.values());
}

export async function analizarPublicacion(
  url: string,
  participantesManuales?: string[],
  cookiesInstagram?: string,
  eliminarDuplicados?: boolean,
  sessionId?: string,
  paseAprobado?: boolean,
  paseId?: string
): Promise<any> {
  const redSocial = detectarRedSocial(url);
  const hayManuales = participantesManuales && participantesManuales.length > 0;

  if (!hayManuales && !redSocial) {
    throw new Error('URL no válida. Debe ser de Instagram, TikTok o YouTube');
  }

  const res = await fetch(`${API_URL}/api/sorteos/analizar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      urlPublicacion: url || null,
      redSocial: redSocial || 'instagram',
      participantesManuales: hayManuales ? participantesManuales : undefined,
      cookies: cookiesInstagram?.trim() || undefined,
      sessionId: sessionId?.trim() || undefined,
      // El scraping se pide SIEMPRE crudo (sin dedupe): el toggle "eliminar
      // duplicados" se aplica localmente en el frontend, sin re-scrapear.
      eliminarDuplicados: false,
      paseAprobado: paseAprobado ?? false,
      paseId: paseId || undefined,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Error al analizar la publicación');
  }

  return data;
}

export async function crearSorteo(config: {
  urlPublicacion: string;
  redSocial: string;
  cantidadGanadores: number;
  cantidadSuplentes: number;
  participantesManuales?: string[];
  cookiesInstagram?: string;
  eliminarDuplicados?: boolean;
  participantesPrecargados?: Participante[];
  sessionId?: string;
  paseAprobado?: boolean;
  paseId?: string;
}): Promise<any> {
  const res = await fetch(`${API_URL}/api/sorteos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Error al crear sorteo');
  }

  return data;
}

export async function estadoInstagram(): Promise<any> {
  const res = await fetch(`${API_URL}/api/sorteos/instagram/estado`);
  return res.json().catch(() => ({ conectado: false }));
}

export async function conectarInstagram(): Promise<any> {
  const res = await fetch(`${API_URL}/api/sorteos/instagram/login`, { method: 'POST' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Error al conectar Instagram');
  }
  return data;
}

export async function desconectarInstagram(): Promise<any> {
  const res = await fetch(`${API_URL}/api/sorteos/instagram/logout`, { method: 'POST' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Error al desconectar Instagram');
  }
  return data;
}

// Estado de la cuota de sorteos gratis de la nube (límite de Apify)
export async function estadoCuota(): Promise<any> {
  const res = await fetch(`${API_URL}/api/sorteos/cuota`);
  return res.json().catch(() => null);
}

// Entrar en la cola de espera cuando la cuota del día está agotada
export async function entrarCola(config: {
  urlPublicacion: string;
  redSocial: string;
  cantidadGanadores: number;
  cantidadSuplentes?: number;
  eliminarDuplicados?: boolean;
}): Promise<any> {
  const res = await fetch(`${API_URL}/api/sorteos/cola`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Error al entrar en la cola');
  }
  return data;
}

// Estado de una solicitud en cola (polling)
export async function estadoCola(solicitudId: string): Promise<any> {
  const res = await fetch(`${API_URL}/api/sorteos/cola/${solicitudId}`);
  return res.json().catch(() => null);
}

// Pase Rápido con MercadoPago: crea la preferencia de pago
export async function crearPasePago(): Promise<any> {
  const res = await fetch(`${API_URL}/api/pagos/pase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Error al crear el pago');
  }
  return data;
}

// Estado del Pase Rápido (se consulta al volver del checkout de MercadoPago)
export async function estadoPase(paseId: string): Promise<any> {
  const res = await fetch(`${API_URL}/api/pagos/pase/${paseId}`);
  const data = await res.json().catch(() => null);
  if (!res.ok) return null;
  return data;
}

// Verificación manual: el backend consulta MP por el payment_id y actualiza el pase
export async function verificarPago(paseId: string, paymentId: string): Promise<any> {
  const res = await fetch(`${API_URL}/api/pagos/verificar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paseId, paymentId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Error al verificar el pago');
  }
  return data;
}
