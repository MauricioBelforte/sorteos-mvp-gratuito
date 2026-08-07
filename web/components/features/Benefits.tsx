'use client';

import { TrendingUp, Users, Shield, Zap, Award, Clock } from 'lucide-react';

export default function Benefits() {
  const benefits = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Mayor alcance orgánico',
      description: 'Los sorteos aumentan el alcance de tu marca hasta un 300% sin inversión en publicidad.',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Aumenta tus seguidores',
      description: 'Atrae seguidores realmente interesados en tu contenido mediante interacciones auténticas.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Transparencia total',
      description: 'Genera certificados de ganador que compartes con tu audiencia para generar confianza.',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Rápido y sin complicaciones',
      description: 'No necesitas registrarte ni descargar nada. Listo en segundos desde cualquier dispositivo.',
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Sorteos profesionales',
      description: 'Configura reglas personalizadas, filtros avanzados y múltiples ganadores.',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Ahorra tiempo',
      description: 'Automatiza el proceso de selección de ganadores en lugar de hacerlo manualmente.',
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50" aria-labelledby="benefits-title">
      <div className="container mx-auto px-4">
        <h2 id="benefits-title" className="text-3xl font-bold text-center mb-4 text-gray-900">
          ¿Por qué hacer sorteos en redes sociales?
        </h2>
        <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          Los sorteos son una de las estrategias más efectivas para hacer crecer tu marca, 
          aumentar el alcance y conectar con tu audiencia de forma orgánica.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100"
            >
              <div className="flex items-start gap-4">
                <div className="bg-indigo-100 text-indigo-600 rounded-lg p-3 flex-shrink-0">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
