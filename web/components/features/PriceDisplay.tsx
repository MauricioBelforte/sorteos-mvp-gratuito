import React from 'react';
import Card from '../ui/Card';

interface RangoPrecio {
  rango: string;
  precio: string;
  descripcion: string;
  icono: React.ReactNode;
  gradiente: string;
  destacado?: boolean;
}

const rangosPrecios: RangoPrecio[] = [
  {
    rango: 'Hasta 1.000',
    precio: 'Gratis',
    descripcion: 'Comentarios',
    gradiente: 'from-green-500 to-emerald-600',
    destacado: true,
    icono: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    rango: 'Hasta 2.000',
    precio: '$5.000 ARS',
    descripcion: 'Comentarios',
    gradiente: 'from-indigo-500 to-blue-600',
    icono: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-12a1 1 0 112 0v.42c.94.13 1.8.52 2.42 1.13a1 1 0 01-1.42 1.4c-.34-.34-.95-.55-1.5-.55-.8 0-1.5.45-1.5 1s.7 1 1.5 1c1.76 0 3.5 1.1 3.5 3 0 .85-.4 1.6-1 2.1v.4a1 1 0 11-2 0v-.36c-.8-.1-1.53-.42-2.1-.94a1 1 0 111.4-1.42c.3.28.85.52 1.5.52.8 0 1.5-.45 1.5-1s-.7-1-1.5-1c-1.76 0-3.5-1.1-3.5-3 0-.85.4-1.6 1-2.1V6z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    rango: '2.001 - 3.000',
    precio: '$6.000 ARS',
    descripcion: 'Comentarios',
    gradiente: 'from-purple-500 to-violet-600',
    icono: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-12a1 1 0 112 0v.42c.94.13 1.8.52 2.42 1.13a1 1 0 01-1.42 1.4c-.34-.34-.95-.55-1.5-.55-.8 0-1.5.45-1.5 1s.7 1 1.5 1c1.76 0 3.5 1.1 3.5 3 0 .85-.4 1.6-1 2.1v.4a1 1 0 11-2 0v-.36c-.8-.1-1.53-.42-2.1-.94a1 1 0 111.4-1.42c.3.28.85.52 1.5.52.8 0 1.5-.45 1.5-1s-.7-1-1.5-1c-1.76 0-3.5-1.1-3.5-3 0-.85.4-1.6 1-2.1V6z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    rango: '3.001 - 10.000',
    precio: '$10.000 ARS',
    descripcion: 'Comentarios',
    gradiente: 'from-pink-500 to-rose-600',
    icono: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-12a1 1 0 112 0v.42c.94.13 1.8.52 2.42 1.13a1 1 0 01-1.42 1.4c-.34-.34-.95-.55-1.5-.55-.8 0-1.5.45-1.5 1s.7 1 1.5 1c1.76 0 3.5 1.1 3.5 3 0 .85-.4 1.6-1 2.1v.4a1 1 0 11-2 0v-.36c-.8-.1-1.53-.42-2.1-.94a1 1 0 111.4-1.42c.3.28.85.52 1.5.52.8 0 1.5-.45 1.5-1s-.7-1-1.5-1c-1.76 0-3.5-1.1-3.5-3 0-.85.4-1.6 1-2.1V6z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    rango: 'Más de 10.000',
    precio: '$10.000 + $1.000',
    descripcion: 'Por cada 1.000 adicionales',
    gradiente: 'from-amber-500 to-orange-600',
    icono: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-12a1 1 0 112 0v.42c.94.13 1.8.52 2.42 1.13a1 1 0 01-1.42 1.4c-.34-.34-.95-.55-1.5-.55-.8 0-1.5.45-1.5 1s.7 1 1.5 1c1.76 0 3.5 1.1 3.5 3 0 .85-.4 1.6-1 2.1v.4a1 1 0 11-2 0v-.36c-.8-.1-1.53-.42-2.1-.94a1 1 0 111.4-1.42c.3.28.85.52 1.5.52.8 0 1.5-.45 1.5-1s-.7-1-1.5-1c-1.76 0-3.5-1.1-3.5-3 0-.85.4-1.6 1-2.1V6z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export default function PriceDisplay() {
  return (
    <section aria-label="Precios de sorteos" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {rangosPrecios.map((rango, index) => (
        <Card
          key={rango.rango}
          padding="md"
          className="fade-in relative overflow-hidden"
        >
          <div style={{ animationDelay: `${index * 60}ms` }}>
            <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${rango.gradiente}`} />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-500">{rango.rango}</p>
                <p className="text-sm text-gray-400">{rango.descripcion}</p>
              </div>
              <span className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${rango.gradiente} text-white shadow-md flex-shrink-0`}>
                {rango.icono}
              </span>
            </div>
            <p className={`mt-4 text-xl font-bold ${rango.destacado ? 'text-green-600' : 'text-gray-900'}`}>
              {rango.precio}
            </p>
          </div>
        </Card>
      ))}
    </section>
  );
}
