# 04 - Código - Mejoras de Backend para Producción

## Estado Actual (Referencia)

- `api/prisma/schema.prisma` → `provider = "sqlite"`, `DATABASE_URL=file:./dev.db`
- Modelos: `Usuario`, `Sorteo`, `Participante` (con `comentario`), `Certificado`
- API Express en `api/src/index.ts` (puerto 4000), rutas en `api/src/routes/` (`auth.ts`, `sorteos.ts`, `pagos.ts`)
- Cliente Prisma singleton: `api/src/lib/prisma.ts`
- Web Next.js 14 en `web/`, cliente API en `web/src/` (usa `localhost:4000`)

## Archivos a Modificar (Previstos)

| Archivo | Cambio |
|---------|--------|
| `api/prisma/schema.prisma` | `provider = "postgresql"` |
| `api/.env` / `.env.production` | `DATABASE_URL` de Supabase/Neon |
| `api/prisma/migrations/` | Migración inicial (`prisma migrate dev --name init`) |
| `api/src/index.ts` | CORS para dominio público de la web; rate limiting básico |
| `web/src/lib/api.ts` (o cliente equivalente) | Usar `NEXT_PUBLIC_API_URL` |
| `web/.env.production` | `NEXT_PUBLIC_API_URL=https://api-publica` |

## Comandos Clave (Proceso de Deploy)

```bash
# Backend (en la plataforma)
npm install
npx playwright install --with-deps chromium
npx prisma generate
npx prisma migrate deploy
npm run build
npm start

# Frontend (Vercel lo hace automáticamente desde GitHub)
# NEXT_PUBLIC_API_URL apuntando a la API pública

# Migración local de prueba
npx prisma migrate dev --name init
```

## Funciones del Motor de Sorteo que se Conservan (NO TOCAR)

- `api/src/lib/` (motor determinístico, hash de verificación)
- `api/src/collectors/` (scrapers IG/TikTok/YT con Playwright)
- Contrato `POST /api/sorteos` y `POST /api/sorteos/analizar`
- `POST /api/pagos/*` (Mercado Pago "próximamente")

## Logs Relacionados

- `Logs/` → este cambio generará logs nuevos (migración, deploy, config).
- Este documento: módulo 06.
