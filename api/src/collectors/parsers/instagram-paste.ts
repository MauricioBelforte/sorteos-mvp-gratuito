import { Participante } from '../types';

const TIMESTAMP_REGEX = /^\d+\s*(sem|min|h|d|w|mo|yr|año|día|hora|mes|semana|segundo)s?\b/i;
const USERNAME_REGEX = /^[a-zA-Z0-9_.]{3,30}$/;
const UI_TEXTOS = [
  'foto del perfil', 'profile picture', 'reply', 'responder',
  'like', 'liked', 'me gusta', 'ver respuestas', 'view replies',
  'traducir', 'translate', 'editado', 'edited', 'denunciar', 'report',
  'ver más', 'view more', 'ocultar', 'hide', 'follow', 'seguir',
  'more options', 'más opciones', 'copiar enlace', 'copy link',
];

function esTextoUI(texto: string): boolean {
  const t = texto.toLowerCase();
  return UI_TEXTOS.some((ui) => t.includes(ui)) || t.startsWith('foto del perfil de');
}

// Parser para texto pegado desde Instagram (Estrategia E).
// Acepta el formato crudo de copiado: usernames en líneas propias, timestamps
// ("125 sem", "3 d"), textos de comentario y etiquetas de UI intercaladas:
//   karen_etcheverry
//   125 sem
//   @ailin_1453 @kevin_1495xd
//   Foto del perfil de karen_etcheverry
export function parsearTextoInstagramPegado(texto: string): Participante[] {
  const lineas = texto.split('\n').map((l) => l.trim()).filter(Boolean);
  const participantes: Participante[] = [];
  const vistos = new Set<string>();

  let i = 0;
  while (i < lineas.length) {
    const linea = lineas[i];

    // ¿Es un username puro (sin @) en su propia línea?
    if (USERNAME_REGEX.test(linea) && !TIMESTAMP_REGEX.test(linea) && !esTextoUI(linea)) {
      const usuario = linea;
      let comentario = '';

      for (let j = i + 1; j < Math.min(i + 6, lineas.length); j++) {
        const sig = lineas[j];
        if (TIMESTAMP_REGEX.test(sig)) continue;
        if (esTextoUI(sig)) continue;
        if (USERNAME_REGEX.test(sig) && !sig.startsWith('@')) break;
        comentario = sig.slice(0, 500);
        break;
      }

      const clave = `${usuario.toLowerCase()}|${comentario.toLowerCase()}`;
      if (!vistos.has(clave)) {
        vistos.add(clave);
        participantes.push({ usuario, comentario });
      }
    }

    i += 1;
  }

  return participantes;
}

// ¿El texto pegado parece copiado crudo de Instagram (usernames sin @ + timestamps)?
export function pareceFormatoInstagram(lineas: string[]): boolean {
  const total = lineas.length;
  if (total < 4) return false;
  const lineasSinArroba = lineas.filter((l) => !l.startsWith('@')).length;
  const conTimestamp = lineas.filter((l) => TIMESTAMP_REGEX.test(l)).length;
  const conUsernamePuro = lineas.filter((l) => USERNAME_REGEX.test(l) && !TIMESTAMP_REGEX.test(l) && !esTextoUI(l)).length;
  return lineasSinArroba / total >= 0.5 && (conTimestamp >= 2 || conUsernamePuro >= 3);
}
