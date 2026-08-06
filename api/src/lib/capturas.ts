import fs from 'fs';
import path from 'path';
import prisma from './prisma';
import { Participante } from '../collectors';

// Carpeta de respaldo local (opcional). La fuente de verdad son las capturas
// en la base de datos: el filesystem de Render/PaaS es efÃ­mero y se pierde.
const CAPTURAS_DIR = path.join(process.cwd(), 'capturas');

export interface DatosCaptura {
  tipo: 'analizar' | 'sorteo';
  urlPublicacion?: string;
  redSocial?: string;
  sesion: string;
  cantidadComentarios: number;
  participantes: Participante[];
  nota?: string;
}

function shortcodeDeUrl(url?: string): string | null {
  if (!url) return null;
  const m = url.match(/\/p\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

function usuarioSesionGuardada(): string {
  try {
    const info = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), '.instagram-session-info.json'), 'utf-8')
    );
    return typeof info?.usuario === 'string' ? `@${info.usuario}` : 'sesion-guardada';
  } catch {
    return 'sesion-guardada';
  }
}

// Guarda un snapshot en la BASE DE DATOS (persistente en producciÃ³n) con el
// dataset completo como JSON. Ademas, en local, deja una copia en disco como
// respaldo y para avanzar el diff manual (opcional y silenciado en producciÃ³n).
export async function guardarCaptura(datos: DatosCaptura): Promise<string | null> {
  try {
    const participantesJson = JSON.stringify(datos.participantes);
    const registrada = await prisma.captura.create({
      data: {
        tipo: datos.tipo,
        urlPublicacion: datos.urlPublicacion || null,
        shortcode: shortcodeDeUrl(datos.urlPublicacion),
        redSocial: datos.redSocial || null,
        sesion: datos.sesion,
        cantidadComentarios: datos.cantidadComentarios,
        participantesJson,
        nota: datos.nota || null,
      },
    });
    console.log(`Captura registrada en DB: ${registrada.id} (${datos.cantidadComentarios} participantes, sesion=${datos.sesion})`);
    return registrada.id;
  } catch (error: any) {
    console.warn('No se pudo registrar la captura en DB:', error.message);
    return null;
  }
}

// Respaldo local opcional (el Filesystem es efÃ­mero en producciÃ³n).
export async function guardarCapturaLocal(datos: DatosCaptura): Promise<string | null> {
  try {
    if (!fs.existsSync(CAPTURAS_DIR)) fs.mkdirSync(CAPTURAS_DIR, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const archivo = path.join(
      CAPTURAS_DIR,
      `${datos.tipo}-${shortcodeDeUrl(datos.urlPublicacion) || 'sin-url'}-${ts}.json`
    );
    const contenido = {
      ...datos,
      guardadoEn: new Date().toISOString(),
    };
    fs.writeFileSync(archivo, JSON.stringify(contenido, null, 2), 'utf-8');
    console.log(`Captura respaldada en disco: ${archivo} (${datos.cantidadComentarios} participantes)`);
    return archivo;
  } catch (error: any) {
    console.warn('No se pudo respaldar la captura en disco:', error.message);
    return null;
  }
}

// Recupera capturas para revisiÃ³n (lista/sorteo por shortcode o por tipo).
export async function listarCapturas(where: { shortcode?: string; tipo?: string } = {}) {
  return prisma.captura.findMany({
    where,
    orderBy: { guardadoEn: 'desc' },
    take: 100,
  });
}

// Normaliza la sesiÃ³n en un valor conciso y legible, siguiendo la misma
// lÃ³gica que usa preview.ts (manual / cookies / guardada / anonima).
export function describirSesion(manual: boolean, conCookies: boolean, sesionGuardadaDisponible: boolean): string {
  if (manual) return 'manual';
  if (conCookies) return 'cookies';
  if (sesionGuardadaDisponible) return `${usuarioSesionGuardada()} (guardada)`;
  return 'anonima';
}

// Persistencia principal: DB + respaldo local. Devuelve el id de la captura en DB.
export async function persistirCaptura(datos: DatosCaptura): Promise<string | null> {
  const id = await guardarCaptura(datos);
  await guardarCapturaLocal(datos);
  return id;
}