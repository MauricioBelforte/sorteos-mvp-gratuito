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
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ),
  },
  {
    rango: 'Hasta 3.000',
    precio: '$6.000 ARS',
    descripcion: 'Comentarios',
    gradiente: 'from-purple-500 to-violet-600',
    icono: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ),
  },
  {
    rango: 'Hasta 10.000',
    precio: '$10.000 ARS',
    descripcion: 'Comentarios',
    gradiente: 'from-pink-500 to-rose-600',
    icono: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
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
