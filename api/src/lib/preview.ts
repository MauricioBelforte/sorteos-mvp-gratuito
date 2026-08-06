import { RedSocialSoportada } from '../collectors';

// Extrae el videoId de una URL de YouTube
function obtenerVideoIdYouTube(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{6,})/);
  return match ? match[1] : null;
}

// Intenta extraer la og:image del HTML de la página (fetch directo)
async function extraerOgImage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
        'Accept-Language': 'es-AR,es;q=0.9',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const html = await res.text();
    const match = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// Obtiene la imagen de la publicación según la red social
export async function extraerImagenPublicacion(
  url: string,
  redSocial: RedSocialSoportada
): Promise<string | null> {
  switch (redSocial) {
    case 'youtube': {
      const videoId = obtenerVideoIdYouTube(url);
      return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
    }
    case 'instagram':
    case 'tiktok':
      return extraerOgImage(url);
    default:
      return null;
  }
}
