'use client';

import { useState } from 'react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: '¿Cómo hacer un sorteo en Instagram?',
      answer: 'Es muy simple: pega el link del post o escribe tu @usuario en el formulario, nuestro sistema recupera todos los comentarios y selecciona aleatoriamente los ganadores. No necesitas dar acceso a tu cuenta de Instagram.',
    },
    {
      question: '¿Es gratis usar esta herramienta?',
      answer: 'Sí, puedes hacer sorteos gratis hasta cierto límite de comentarios. Para sorteos con más comentarios, ofrecemos precios accesibles sin suscripción. Pagás solo cuando lo necesitás.',
    },
    {
      question: '¿Necesito iniciar sesión con mi cuenta de Instagram?',
      answer: 'Tienes dos opciones: puedes hacer sorteos sin iniciar sesión mediante búsqueda anónima, o iniciar sesión para acceder a comentarios que la búsqueda anónima no pueda recuperar. En ambos casos tu privacidad y seguridad están protegidas.',
    },
    {
      question: '¿Cómo aseguran la equidad en el proceso de selección?',
      answer: 'Utilizamos un algoritmo de selección aleatoria criptográficamente seguro. Además, generamos un certificado de ganador que puedes compartir para demostrar la transparencia del sorteo.',
    },
    {
      question: '¿Qué plataformas de redes sociales admite?',
      answer: 'Actualmente soportamos Instagram, TikTok y YouTube. Próximamente agregaremos Facebook, Twitter (X), LinkedIn y más plataformas.',
    },
    {
      question: '¿Puedo filtrar comentarios duplicados?',
      answer: 'Sí, nuestra herramienta permite filtrar comentarios duplicados para asegurar que cada participante tenga una sola oportunidad de ganar.',
    },
    {
      question: '¿Puedo hacer sorteos con múltiples ganadores?',
      answer: 'Sí, puedes configurar la cantidad de ganadores principales y suplentes que necesitas para tu sorteo.',
    },
    {
      question: '¿Dónde encuentro la URL de un post de Instagram?',
      answer: 'En la app de Instagram, toca los tres puntos (...) en la esquina superior derecha del post y selecciona "Copiar enlace". En la versión web, simplemente copia la URL de la barra del navegador.',
    },
    {
      question: '¿Puedo obtener un certificado del ganador?',
      answer: 'Sí, al finalizar el sorteo generamos automáticamente un certificado con los datos del ganador que puedes descargar y compartir en tus redes sociales.',
    },
    {
      question: '¿Funciona con cuentas privadas?',
      answer: 'No, los posts deben ser públicos y tener los comentarios desbloqueados. No podemos acceder a contenido de cuentas privadas por políticas de las plataformas.',
    },
  ];

  return (
    <section className="py-16 bg-white" aria-labelledby="faq-title">
      <div className="container mx-auto px-4">
        <h2 id="faq-title" className="text-3xl font-bold text-center mb-4 text-gray-900">
          Preguntas Frecuentes
        </h2>
        <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Antes de que preguntes, ya te respondimos
        </p>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
                aria-expanded={openIndex === index}
              >
                <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                {openIndex === index ? (
                  <svg className="w-5 h-5 text-gray-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 pt-0">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
