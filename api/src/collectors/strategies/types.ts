import { Page } from 'playwright';
import { Participante } from '../types';

export interface ContextoScraping {
  page: Page;
  url: string;
  shortcode: string;
  mediaId: string | null;
  autorExcluido: string;
  cantidadMaxima: number;
  tieneSesion: boolean;
  cantidadEsperada: number | null;
  // Toggle "eliminar duplicados": si es false se conservan comentarios repetidos
  eliminarDuplicados: boolean;
  // Si el usuario pagó el Pase Rápido: permite gastar Apify sin cuota
  paseAprobado?: boolean;
}

export type EstrategiaFn = (ctx: ContextoScraping) => Promise<Participante[]>;
