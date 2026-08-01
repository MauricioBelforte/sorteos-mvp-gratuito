# Sorteos MVP Gratuito

Versión simplificada y gratuita del sistema de sorteos para MVP inicial.

## Características

- **Solo plan free**: 3 sorteos por mes por usuario
- **Redes sociales**: Instagram, TikTok, YouTube (solo scraping con Playwright)
- **Sin pagos**: Eliminado Mercado Pago temporalmente
- **Infraestructura gratuita**: Vercel + Supabase + Upstash

## Arquitectura

- Frontend: Next.js (Vercel)
- Backend: Express (Vercel)
- Base de datos: PostgreSQL (Supabase)
- Cola: Redis (Upstash)
- Scraping: Playwright

## Diferencias con versión completa

- Eliminado: Twitter/X (API es pago)
- Eliminado: Facebook (API requiere aprobación)
- Eliminado: Mercado Pago (solo plan free)
- Eliminado: Planes starter/pro/anual
- Eliminado: Panel de administración
- Simplificado: Solo recolección por scraping

## Límites de servicios gratuitos

- Supabase: 500MB de datos (~10k sorteos)
- Upstash: 10k comandos Redis/mes (~500 sorteos/mes)
- Vercel: 100GB bandwidth/mes

## Instalación

```bash
npm install
```

## Variables de entorno

```env
DATABASE_URL= # Supabase connection string
REDIS_URL= # Upstash connection string
APP_BASE_URL= # Vercel URL
```

## Ejecución local

```bash
npm run dev
```
