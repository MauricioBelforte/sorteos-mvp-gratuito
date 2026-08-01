import './globals.css'
import { generateOpenGraph, generateTwitterCard } from '@shared/seo'

export const metadata = {
  title: 'Sorteos MVP Gratuito - Sistema de Sorteos Online',
  description: 'Realiza sorteos gratuitos en Instagram, TikTok y YouTube. Sistema determinístico y verificable. Ideal para influencers y marcas en Latinoamérica.',
  keywords: ['sorteos', 'instagram', 'tiktok', 'youtube', 'gratuito', 'latinoamerica', 'influencers', 'marcas'],
  openGraph: {
    title: 'Sorteos MVP Gratuito - Sistema de Sorteos Online',
    description: 'Realiza sorteos gratuitos en Instagram, TikTok y YouTube. Sistema determinístico y verificable. Ideal para influencers y marcas en Latinoamérica.',
    type: 'website',
    locale: 'es_AR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sorteos MVP Gratuito - Sistema de Sorteos Online',
    description: 'Realiza sorteos gratuitos en Instagram, TikTok y YouTube. Sistema determinístico y verificable. Ideal para influencers y marcas en Latinoamérica.',
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
