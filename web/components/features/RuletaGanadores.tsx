'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getRedInfo, Participante } from '../../lib/sorteos';

interface RuletaGanadoresProps {
  participantes: (string | Participante)[];
  ganadores: string[];
  redSocial: string;
  onTerminar?: () => void;
}

export default function RuletaGanadores({
  participantes,
  ganadores,
  redSocial,
  onTerminar,
}: RuletaGanadoresProps) {
  const [indiceVisible, setIndiceVisible] = useState(0);
  const [ganadorResaltado, setGanadorResaltado] = useState(false);
  const [vueltaActual, setVueltaActual] = useState(0);
  const [terminado, setTerminado] = useState(false);
  const stopRef = useRef(false);

  const redInfo = getRedInfo(redSocial);
  const gradiente = redInfo?.gradiente || 'from-indigo-500 to-purple-600';
  const colorTexto = redInfo?.color || 'text-indigo-500';

  const lista: Participante[] = participantes.map((p) =>
    typeof p === 'string' ? { usuario: p, comentario: '' } : p
  );

  useEffect(() => {
    if (!lista.length || !ganadores.length) {
      setTerminado(true);
      onTerminar?.();
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      setIndiceVisible(0);
      setGanadorResaltado(true);
      setTimeout(() => {
        setTerminado(true);
        onTerminar?.();
      }, 500);
      return;
    }

    stopRef.current = false;
    const totalPasos = 55;
    const tiempoBase = 45;

    const girarVuelta = (idxGanador: number, siguiente: () => void) => {
      let paso = 0;
      const posicionGanador = lista.findIndex((p) => p.usuario === ganadores[idxGanador]);
      const indiceFinal = posicionGanador >= 0 ? posicionGanador : idxGanador % lista.length;

      const girar = () => {
        if (stopRef.current) return;
        paso += 1;
        const t = paso / totalPasos;
        const delay = tiempoBase + t * t * 360;

        if (paso >= totalPasos) {
          setIndiceVisible(indiceFinal);
          setGanadorResaltado(true);
          window.setTimeout(siguiente, 1300);
          return;
        }

        setIndiceVisible(Math.floor(Math.random() * lista.length));
        window.setTimeout(girar, delay);
      };

      girar();
    };

    let vuelta = 0;
    const siguienteVuelta = () => {
      if (stopRef.current) return;
      if (vuelta < ganadores.length) {
        setVueltaActual(vuelta);
        setGanadorResaltado(false);
        girarVuelta(vuelta, () => {
          vuelta += 1;
          siguienteVuelta();
        });
      } else {
        setTerminado(true);
        onTerminar?.();
      }
    };

    siguienteVuelta();

    return () => {
      stopRef.current = true;
    };
  }, [lista.length, ganadores, onTerminar]);

  const participanteVisible = lista[indiceVisible];
  const nombreGanador = ganadores[vueltaActual] || '';
  const comentarioGanador = lista.find((p) => p.usuario === nombreGanador)?.comentario || '';

  const nombreVisible = participanteVisible ? `@${participanteVisible.usuario}` : '';
  const nombreFinal = terminado
    ? ganadores.map((g) => `@${g}`).join(', ')
    : ganadorResaltado
    ? `@${nombreGanador}`
    : nombreVisible;

  return (
    <div className="animate-scale-in rounded-2xl overflow-hidden shadow-xl border border-gray-100">
      <div className={`bg-gradient-to-r ${gradiente} px-6 py-4 flex items-center justify-between`}>
        <p className="text-white font-bold text-sm sm:text-base">
          {terminado ? '¡Resultado final!' : `Sorteando ganador ${vueltaActual + 1} de ${ganadores.length}`}
        </p>
        {!terminado && (
          <span className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white/80 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        )}
      </div>

      <div className="bg-white p-6 sm:p-8 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, ${redInfo?.color === 'text-pink-500' ? '#ec4899' : '#6366f1'} 1px, transparent 1px)`,
            backgroundSize: '18px 18px',
          }}
        />

        <div className="relative z-10 min-h-[130px] flex flex-col items-center justify-center gap-3">
          {!terminado && (
            <span className={`text-xs font-bold uppercase tracking-widest ${colorTexto}`}>
              {ganadorResaltado ? '★ Ganador ★' : 'Participantes'}
            </span>
          )}

          <p
            key={`${vueltaActual}-${indiceVisible}-${ganadorResaltado}`}
            className={`
              text-2xl sm:text-3xl font-extrabold break-words max-w-full transition-colors
              ${terminado ? `text-gray-900 ${colorTexto}` : 'text-gray-800'}
              ${ganadorResaltado && !terminado ? `bg-gradient-to-r ${gradiente} bg-clip-text text-transparent scale-110` : ''}
              ${ganadorResaltado ? 'animate-scale-in' : ''}
            `}
          >
            {nombreFinal}
          </p>

          {ganadorResaltado && comentarioGanador && (
            <div className="max-w-full bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100 animate-scale-in">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                Su comentario
              </p>
              <p className="text-sm text-gray-600 italic break-words leading-snug">
                “{comentarioGanador}”
              </p>
            </div>
          )}

          {ganadorResaltado && (
            <span className="text-3xl animate-bounce" aria-hidden="true">
              {terminado ? '🏆' : '🎉'}
            </span>
          )}

          {terminado && (
            <p className="text-sm text-gray-500">
              {ganadores.length > 1 ? `${ganadores.length} ganadores seleccionados` : '1 ganador seleccionado'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
