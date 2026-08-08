import * as fs from 'node:fs';

// Observabilidad de memoria para el plan free de Render (512 MB, sin métricas en
// dashboard). Módulo 10: permite medir el margen real del contenedor durante el
// scraping de la Estrategia G y validar cada optimización de RAM.
//
// IMPORTANTE: memory.current del cgroup incluye page cache (binarios del
// Chromium, datos leídos del filesystem) que NO es memoria de proceso real y
// NO provoca OOM (el kernel la reclama cuando la necesita). La cifra que
// importa para el OOM es la memoria ANÓNIMA (memory.stat -> anon), que es la
// que el kernel NO puede liberar sin matar procesos.

export interface MedicionMemoria {
  usadoMb: number;
  limiteMb: number;
  rssMb: number;
  anonMb: number;
  cacheMb: number;
}

export function memoriaContenedor(): MedicionMemoria {
  let usado = 0;
  let limite = 0;
  let anon = 0;
  let cache = 0;
  try {
    limite = parseInt(fs.readFileSync('/sys/fs/cgroup/memory.max', 'utf-8').trim(), 10);
    usado = parseInt(fs.readFileSync('/sys/fs/cgroup/memory.current', 'utf-8').trim(), 10);
    const stat = fs.readFileSync('/sys/fs/cgroup/memory.stat', 'utf-8');
    for (const linea of stat.split('\n')) {
      if (linea.startsWith('anon ')) anon = parseInt(linea.split(' ')[1] || '0', 10);
      else if (linea.startsWith('file ')) cache = parseInt(linea.split(' ')[1] || '0', 10);
    }
  } catch {
    // Sin cgroup (local): usado/limite quedan en 0 y solo sirve rssMb.
  }
  const rssMb = Math.round((process.memoryUsage().rss || 0) / 1024 / 1024);
  const aMb = (v: number) => (v > 0 ? Math.round(v / 1024 / 1024) : 0);
  return { usadoMb: aMb(usado), limiteMb: aMb(limite), rssMb, anonMb: aMb(anon), cacheMb: aMb(cache) };
}

export function logMemoria(etiqueta: string): void {
  const m = memoriaContenedor();
  console.log(`MEM: ${etiqueta} ${JSON.stringify(m)}`);
}