'use client';

import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ResultCardProps {
  resultado: any;
  onReiniciar?: () => void;
}

export default function ResultCard({ resultado, onReiniciar }: ResultCardProps) {
  const [copiado, setCopiado] = useState(false);

  if (!resultado) return null;

  const copiarHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  };

  if (resultado.requierePago) {
    return (
      <Card padding="md" className="animate-scale-in border-t-4 border-yellow-400 bg-yellow-50/50">
        <div className="flex items-start gap-4">
          <span className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 text-2xl" aria-hidden="true">
            💰
          </span>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Este sorteo requiere pago</h3>
            <p className="text-gray-700 mb-3">{resultado.mensaje}</p>
            <p className="text-2xl font-extrabold text-yellow-600 mb-1">
              ${resultado.precio.toLocaleString('es-AR')} {resultado.moneda}
            </p>
            <p className="text-xs text-gray-500 mb-1">
              {resultado.cantidadComentarios.toLocaleString('es-AR')} comentarios detectados
            </p>
            <p className="text-sm text-gray-500 mt-3">
              * Implementación de pagos próximamente
            </p>
          </div>
        </div>
        {onReiniciar && (
          <div className="mt-4">
            <Button variant="outline" onClick={onReiniciar}>Probar con otra publicación</Button>
          </div>
        )}
      </Card>
    );
  }

  if (resultado.sorteo) {
    const ganadores: string[] = resultado.sorteo.ganadores || [];
    const suplentes: string[] = resultado.sorteo.suplentes || [];
    const hash = resultado.sorteo.hashVerificacion || '';
    const comentarios: { usuario: string; comentario: string }[] = resultado.comentarios || [];
    const comentarioDe = (usuario: string) => {
      const encontrado = comentarios.find((c) => c.usuario === usuario);
      return encontrado?.comentario || '';
    };

    return (
      <Card padding="md" className="animate-scale-in border-t-4 border-green-500 bg-green-50/50">
        <div className="flex items-start gap-4">
          <span className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-2xl" aria-hidden="true">
            🏆
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Sorteo creado exitosamente</h3>

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">
                {ganadores.length > 1 ? `Ganadores (${ganadores.length})` : 'Ganador'}
              </p>
              <ul className="space-y-2">
                {ganadores.map((g, i) => {
                  const comentario = comentarioDe(g);
                  return (
                    <li
                      key={`${g}-${i}`}
                      className={`bg-white rounded-lg px-4 py-2.5 border border-green-100 ${i === 0 ? 'shadow-sm' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                          {i + 1}
                        </span>
                        <span className="text-base font-bold text-green-700 break-words">
                          @{g.startsWith('@') ? g.slice(1) : g}
                        </span>
                      </div>
                      {comentario && (
                        <p className="mt-1.5 ml-10 text-sm text-gray-600 italic break-words leading-snug">
                          “{comentario}”
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {suplentes.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Suplentes ({suplentes.length})</p>
                <ul className="space-y-1.5">
                  {suplentes.map((s, i) => {
                    const comentario = comentarioDe(s);
                    return (
                      <li key={`${s}-${i}`} className="bg-white/70 rounded-lg px-4 py-2 border border-gray-100">
                        <div className="flex items-center gap-3">
                          <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">
                            {i + 1}
                          </span>
                          <span className="text-sm font-semibold text-gray-600 break-words">
                            @{s.startsWith('@') ? s.slice(1) : s}
                          </span>
                        </div>
                        {comentario && (
                          <p className="mt-1 ml-9 text-xs text-gray-500 italic break-words leading-snug">
                            “{comentario}”
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="mb-2">
              <p className="text-sm text-gray-500 mb-1">Hash de verificación</p>
              <div className="flex items-center gap-2 flex-wrap">
                <code className="flex-1 min-w-0 bg-gray-100 rounded-lg px-3 py-2 font-mono text-xs sm:text-sm text-gray-800 break-all border border-gray-200">
                  {hash}
                </code>
                {hash && (
                  <Button
                    size="sm"
                    variant={copiado ? 'outline' : 'secondary'}
                    onClick={() => copiarHash(hash)}
                    className="flex-shrink-0"
                    aria-label="Copiar hash de verificación"
                  >
                    {copiado ? '¡Copiado!' : 'Copiar'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        {onReiniciar && (
          <div className="mt-4">
            <Button variant="outline" onClick={onReiniciar}>Crear otro sorteo</Button>
          </div>
        )}
      </Card>
    );
  }

  return null;
}
