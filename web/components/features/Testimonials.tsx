'use client';

export default function Testimonials() {
  const testimonials = [
    {
      name: 'María González',
      handle: '@maria_gonzalez',
      rating: 5,
      text: 'Super recomendado!! Increíblemente fácil de usar y los resultados son 100% transparentes. Mis seguidores confían totalmente en los sorteos.',
    },
    {
      name: 'Carlos Martínez',
      handle: '@carlos_martinez',
      rating: 5,
      text: 'Aumenté mis ventas significativamente. El diseño es excelente y la experiencia de usuario es impecable. 100% recomendado.',
    },
    {
      name: 'Ana Sofía López',
      handle: '@anasofia_lopez',
      rating: 5,
      text: 'Muy simple de utilizar. En minutos tenía mi sorteo listo y los ganadores seleccionados. Ya no hago sorteos manualmente.',
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white" aria-labelledby="testimonials-title">
      <div className="container mx-auto px-4">
        <h2 id="testimonials-title" className="text-3xl font-bold text-center mb-4 text-gray-900">
          Lo que dicen nuestros usuarios
        </h2>
        <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Miles de marcas e influencers ya usan nuestra herramienta cada semana
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">"{testimonial.text}"</p>
              <div>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.handle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
