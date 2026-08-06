'use client';

import Card from '../components/ui/Card';
import SorteoWizard from '../components/features/SorteoWizard';
import PriceDisplay from '../components/features/PriceDisplay';
import SocialIcons from '../components/features/SocialIcons';

export default function Home() {
  return (
    <main className="container py-10 sm:py-14">
      {/* Hero */}
      <section className="text-center mb-12 sm:mb-16 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Sorteos Gratuito
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Sistema de sorteos para Instagram, TikTok y YouTube
        </p>
        <SocialIcons size="lg" className="gap-8" />
      </section>

      {/* Wizard de sorteo */}
      <section aria-label="Crear sorteo" className="max-w-2xl mx-auto mb-10 sm:mb-14">
        <Card padding="md" hover={false} className="sm:p-8 animate-fade-in">
          <h2 className="text-xl font-bold text-center mb-6 text-gray-900">Crear Sorteo</h2>
          <SorteoWizard />
        </Card>
      </section>

      {/* Precios */}
      <section aria-label="Precios" className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Precios</h2>
        <PriceDisplay />
      </section>
    </main>
  );
}
