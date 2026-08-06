import './globals.css'
import { generateOpenGraph, generateTwitterCard } from '@shared/seo'

export const metadata = {
  title: 'Sorteosypromos - Sistema de Sorteos y Promociones',
  description: 'Realiza tu sorteo hasta 1000 comentarios gratis. Herramienta de sorteos y promociones para Instagram, TikTok y YouTube.',
  keywords: ['sorteos', 'instagram', 'tiktok', 'youtube', 'gratuito', 'latinoamerica', 'influencers', 'marcas'],
  openGraph: {
    title: 'Sorteosypromos - Sistema de Sorteos y Promociones',
    description: 'Realiza tu sorteo hasta 1000 comentarios gratis. Herramienta de sorteos y promociones para Instagram, TikTok y YouTube.',
    type: 'website',
    locale: 'es_AR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sorteosypromos - Sistema de Sorteos y Promociones',
    description: 'Realiza tu sorteo hasta 1000 comentarios gratis. Herramienta de sorteos y promociones para Instagram, TikTok y YouTube.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
