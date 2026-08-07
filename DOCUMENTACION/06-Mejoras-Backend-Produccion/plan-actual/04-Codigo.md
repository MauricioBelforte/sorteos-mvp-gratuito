# 04 - Código - Mejoras de Backend para Producción

## Estado Actual (Referencia)

- `api/prisma/schema.prisma` → `provider = "postgresql"` (Supabase)
- Modelos: `Usuario`, `Sorteo`, `Participante` (con `comentario`), `Certificado`, `Captura`, `CuotaApify`, `SolicitudCola`, `PagoPase`
- API Express en `api/src/index.ts` (puerto 4000), rutas en `api/src/routes/` (`auth.ts`, `sorteos.ts`, `pagos.ts`)
- Cliente Prisma singleton: `api/src/lib/prisma.ts`
- Web Next.js 14 en `web/`, cliente API en `web/src/` (usa `localhost:4000`)
- **Deploy (Log 40):** API LIVE en Render — `https://sorteos-api-y0dp.onrender.com`
  - `DATABASE_URL` usa el **pooler** de Supabase en `aws-0-sa-east-1.pooler.supabase.com:5432` con usuario `postgres.tfqdkrbtmtfhywlvquyq` (el host directo `db.<ref>.supabase.co` solo resuelve IPv6 y Render es IPv4-only).

## Archivos a Modificar (Previstos)

| Archivo | Cambio |
|---------|--------|
| `api/prisma/schema.prisma` | `provider = "postgresql"` |
| `api/.env` / `.env.production` | `DATABASE_URL` de Supabase/Neon (pooler) |
| `api/prisma/migrations/` | Migración inicial (`prisma migrate dev --name init`) |
| `api/src/index.ts` | CORS para dominio público de la web; rate limiting básico |
| `web/src/lib/api.ts` (o cliente equivalente) | Usar `NEXT_PUBLIC_API_URL` |
| `web/.env.production` | `NEXT_PUBLIC_API_URL=https://sorteos-api-y0dp.onrender.com` |

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

## Deploy en Render (Log 40) — Notas

- **Dockerfile propio** en la raíz: instala Chrome (`google-chrome-stable`) + Xvfb; el CMD arranca `Xvfb :99 -ac` en background y `node` en primer plano con `DISPLAY=:99` (reemplazó a `xvfb-run`, que fallaba por `xauth` y no dejaba abrir el puerto).
- **DB:** la conexión usa el **session pooler** de Supabase (`aws-0-sa-east-1.pooler.supabase.com:5432`, usuario `postgres.<ref>`, sin flags). El host directo `db.<ref>.supabase.co` no tiene registro IPv4 → `Can't reach database server` desde Render.
- **Env vars en Render (10):** `DATABASE_URL` (pooler), `JWT_SECRET`, `MERCADO_PAGO_ACCESS_TOKEN`, `MERCADO_PAGO_WEBHOOK_SECRET`, `APIFY_TOKEN`, `APIFY_CUOTA_MENSUAL=45`, `PRECIO_PASE_COLA=2500`, `WEB_APP_URL`, `API_BASE_URL=https://sorteos-api-y0dp.onrender.com`, `RATE_LIMIT=100`.
- **API pública:** `GET /health`, `GET /api/sorteos/cuota`, `/api/sorteos/analizar`, `/api/sorteos/cola`, `/api/pagos/*`. CORS restringido: origen no permitido → 403.
- **API REST de Render usada:** `PUT /v1/services/{id}/env-vars` (body = **array** directo `[{key,value}]`), `POST /v1/services/{id}/deploys` (`{"clearCache":"do_not_clear"}`), con `Authorization: Bearer $RENDER_API_KEY`.

## Funciones del Motor de Sorteo que se Conservan (NO TOCAR)

- `api/src/lib/` (motor determinístico, hash de verificación)
- `api/src/collectors/` (scrapers IG/TikTok/YT con Playwright)
- Contrato `POST /api/sorteos` y `POST /api/sorteos/analizar`
- `POST /api/pagos/*` (Mercado Pago "próximamente")

## Logs Relacionados

- `Logs/` → este cambio generará logs nuevos (migración, deploy, config).
- Este documento: módulo 06.
