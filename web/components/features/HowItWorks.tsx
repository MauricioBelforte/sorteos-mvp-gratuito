'use client';

import { Instagram, Youtube, MessageCircle, CheckCircle } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: <Instagram className="w-8 h-8" />,
      title: 'Ingresa tu usuario o URL',
      description: 'Pega el link del post o escribe tu @usuario de Instagram, TikTok o YouTube.',
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: 'Cargamos los comentarios',
      description: 'Nuestro sistema recupera todos los comentarios de la publicación seleccionada.',
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: 'Configura tu sorteo',
      description: 'Define cantidad de ganadores, suplentes y reglas personalizadas si lo necesitas.',
    },
    {
      icon: <Youtube className="w-8 h-8" />,
      title: '¡Obtén el ganador!',
      description: 'El sistema selecciona aleatoriamente los ganadores y genera un certificado.',
    },
  ];

  return (
    <section className="py-16 bg-white" aria-labelledby="how-it-works-title">
      <div className="container mx-auto px-4">
        <h2 id="how-it-works-title" className="text-3xl font-bold text-center mb-4 text-gray-900">
          ¿Cómo funciona tu sorteo?
        </h2>
        <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          En 4 simples pasos podrás crear sorteos profesionales en segundos
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl p-6 h-full flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-shadow">
                <div className="mb-4">
                  {step.icon}
                </div>
                <div className="absolute -top-3 -left-3 bg-rose-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-white/90">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
