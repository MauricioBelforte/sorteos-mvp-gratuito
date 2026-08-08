'use client';

import Card from '../components/ui/Card';
import SorteoWizard from '../components/features/SorteoWizard';
import PriceDisplay from '../components/features/PriceDisplay';
import SocialIcons from '../components/features/SocialIcons';
import HowItWorks from '../components/features/HowItWorks';
import Benefits from '../components/features/Benefits';
import FAQ from '../components/features/FAQ';
import Testimonials from '../components/features/Testimonials';

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="container py-10 sm:py-14 text-center animate-fade-in">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Sorteos Gratuitos para Instagram, TikTok y YouTube
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Crea sorteos profesionales y gratuitos desde tus redes sociales. Elige un comentario ganador al azar entre tus fotos y videos en segundos. Sin registro, sin descargas, sin complicaciones.
        </p>
        <SocialIcons size="lg" className="gap-8" />
      </section>

      {/* Wizard de sorteo */}
      <section aria-label="Crear sorteo" className="container max-w-2xl mx-auto mb-10 sm:mb-14">
        <Card padding="lg" hover={false} className="sm:p-8 animate-fade-in">
          <h2 className="text-xl font-bold text-center mb-6 text-gray-900">Pega la dirección de tu publicación</h2>
          <SorteoWizard />
        </Card>
      </section>

      {/* Cómo funciona */}
      <HowItWorks />

      {/* Beneficios */}
      <Benefits />

      {/* Testimonios */}
      <Testimonials />

      {/* Precios */}
      <section aria-label="Precios" className="container py-16 bg-white">
        <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">Precios Accesibles</h2>
        <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Sorteos gratis hasta cierto límite. Pagás solo cuando lo necesitás.
        </p>
        <PriceDisplay />
      </section>

      {/* FAQ */}
      <FAQ />
    </main>
  );
}