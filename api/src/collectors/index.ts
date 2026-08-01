import { recolectarInstagram, validarUrlInstagram } from './instagram';
import { recolectarTikTok, validarUrlTikTok } from './tiktok';
import { recolectarYouTube, validarUrlYouTube } from './youtube';

export type RedSocialSoportada = 'instagram' | 'youtube' | 'tiktok';

export async function recolectarComentarios(url: string, redSocial: RedSocialSoportada): Promise<string[]> {
  switch (redSocial) {
    case 'instagram':
      if (!validarUrlInstagram(url)) {
        throw new Error('URL de Instagram inválida');
      }
      return recolectarInstagram(url);
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
