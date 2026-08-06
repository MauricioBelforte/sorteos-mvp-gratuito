import { recolectarInstagramV2 as recolectarInstagram, validarUrlInstagram } from './instagram-v2';
import { recolectarTikTok, validarUrlTikTok } from './tiktok';
import { recolectarYouTube, validarUrlYouTube } from './youtube';
import { Participante } from './types';
import { parsearTextoInstagramPegado, pareceFormatoInstagram } from './parsers/instagram-paste';

export type { Participante } from './types';

export type RedSocialSoportada = 'instagram' | 'youtube' | 'tiktok';

// Parsea líneas pegadas manualmente (formato "@usuario comentario" o solo "comentario").
// Si el texto pegado parece copiado crudo de Instagram (usernames + timestamps),
// se usa el parser especializado que reconstruye los pares usuario → comentario.
export function parsearParticipantesManuales(lineas: string[]): Participante[] {
  if (pareceFormatoInstagram(lineas)) {
    const parseados = parsearTextoInstagramPegado(lineas.join('\n'));
    if (parseados.length >= 2) {
      console.log(`Instagram V2 [manual]: formato crudo de Instagram detectado, ${parseados.length} participantes`);
      return parseados;
    }
  }

  const participantes: Participante[] = [];
  const vistos = new Set<string>();

  for (const lineaRaw of lineas) {
    const linea = lineaRaw.trim();
    if (!linea) continue;

    let usuario: string;
    let comentario: string;

    if (linea.startsWith('@')) {
      const match = linea.match(/^@([a-zA-Z0-9_.]{3,30})(?:\s+(.+))?$/);
      if (match) {
        usuario = match[1];
        comentario = (match[2] || '').trim();
      } else {
        // @ inválido: tratar el resto como comentario anónimo
        usuario = `Anónimo ${participantes.length + 1}`;
        comentario = linea.slice(1).trim().slice(0, 500);
      }
    } else {
      // Sin usuario: el comentario es el participante
      usuario = `Anónimo ${participantes.length + 1}`;
      comentario = linea.slice(0, 500);
    }

    const clave = `${usuario}|${comentario}`;
    if (vistos.has(clave)) continue;
    vistos.add(clave);

    // Si el usuario ya existe con otro comentario, desambiguar con sufijo
    if (participantes.some((p) => p.usuario === usuario)) {
      let sufijo = 2;
      let usuarioFinal = `${usuario}${sufijo}`;
      while (participantes.some((p) => p.usuario === usuarioFinal)) {
        sufijo += 1;
        usuarioFinal = `${usuario}${sufijo}`;
      }
      usuario = usuarioFinal;
    }

    participantes.push({ usuario, comentario });
  }

  return participantes;
}

export async function recolectarComentarios(
  url: string,
  redSocial: RedSocialSoportada,
  cookieStr: string = '',
  eliminarDuplicados: boolean = true,
  opciones: { paseAprobado?: boolean } = {}
): Promise<Participante[]> {
  switch (redSocial) {
    case 'instagram':
      if (!validarUrlInstagram(url)) {
        throw new Error('URL de Instagram inválida');
      }
      return recolectarInstagram(url, 10000, cookieStr, {
        eliminarDuplicados,
        paseAprobado: opciones.paseAprobado,
      });
    case 'youtube':
      if (!validarUrlYouTube(url)) {
        throw new Error('URL de YouTube inválida');
      }
      return recolectarYouTube(url);
    case 'tiktok':
      if (!validarUrlTikTok(url)) {
        throw new Error('URL de TikTok inválida');
      }
      return recolectarTikTok(url);
    default:
      throw new Error('Red social no soportada');
  }
}

export function validarUrl(url: string, redSocial: RedSocialSoportada): boolean {
  switch (redSocial) {
    case 'instagram':
      return validarUrlInstagram(url);
    case 'youtube':
      return validarUrlYouTube(url);
    case 'tiktok':
      return validarUrlTikTok(url);
    default:
      return false;
  }
}
