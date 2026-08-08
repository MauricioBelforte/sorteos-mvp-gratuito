import './globals.css'
// import { generateOpenGraph, generateTwitterCard } from '@shared/seo'

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Sorteos Gratuitos | Crea Sorteos en Instagram, TikTok y YouTube',
  description: 'Crea sorteos gratuitos desde Instagram, TikTok y YouTube. Elige un comentario ganador al azar entre tus fotos y videos. Sin registro, sin descargas, totalmente gratis hasta cierto límite. Herramienta profesional para marcas e influencers.',
  keywords: [
    'sorteos instagram',
    'sorteos tiktok',
    'sorteos youtube',
    'sorteador de comentarios',
    'sorteo gratis',
    'ganador instagram',
    'herramienta sorteos',
    'sorteos redes sociales',
    'sorteador online',
    'seleccionar ganador',
    'sorteos latam',
    'sorteos argentina',
    'sorteos para influencers',
    'sorteos para marcas',
    'sorteos profesionales',
    'certificado ganador',
    'sorteos transparentes',
    'aumentar seguidores',
    'sorteos marketing',
    'sorteos promociones',
  ],
  openGraph: {
    title: 'Sorteos Gratuitos | Crea Sorteos en Instagram, TikTok y YouTube',
    description: 'Crea sorteos gratuitos desde Instagram, TikTok y YouTube. Elige un comentario ganador al azar entre tus fotos y videos. Sin registro, sin descargas.',
    type: 'website',
    locale: 'es_AR',
    siteName: 'Sorteos Gratuitos',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sorteos Gratuitos | Crea Sorteos en Instagram, TikTok y YouTube',
    description: 'Crea sorteos gratuitos desde Instagram, TikTok y YouTube. Elige un comentario ganador al azar entre tus fotos y videos.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
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
