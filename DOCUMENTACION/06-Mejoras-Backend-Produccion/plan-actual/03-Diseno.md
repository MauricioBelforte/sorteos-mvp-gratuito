# 03 - Diseño - Mejoras de Backend para Producción

## Arquitectura Objetivo (IMPLEMENTADA 2026-08-07)

```
[ Usuario final (cualquier persona) ]
                │
                ▼  HTTPS
        [ Web Next.js 14 — Vercel ]        ← sorteos-mvp-gratuito-nine.vercel.app
                │
                │  /api/* (fetch, CORS restringido)
                ▼
      [ API Express — Render ]             ← sorteos-api-y0dp.onrender.com
        (proceso Node persistente + Playwright)
                │
                ▼  Prisma (PostgreSQL, pooler)
        [ Supabase Postgres ]              ← aws-0-sa-east-1.pooler.supabase.com
```

### Detalles reales de la implementación

- **Monorepo npm workspaces** en la raíz del repo: `api/`, `web/`, `shared-modules/*`. Vercel instala desde la raíz y resuelve `@shared/seo` (commit `17c8f9d`). `web/vercel.json` fuerza la detección de Next.js (commit `a6eea45`).
- **Render**: Dockerfile con `npm install --workspaces`, luego build solo de `api/`. CMD arranca `Xvfb :99` + `node dist/index.js`. Chrome real (`channel: 'chrome'`) se usa para la **Estrategia G** (scroll anónimo completo de Instagram, alcanza ~140–2393 comentarios sin sesión).
- **CORS** restringido en `api/src/index.ts`: `WEB_APP_URL` + `http(s)://localhost` + `https://sorteos-mvp-gratuito-nine.vercel.app` (commit `f0f0d46`).
- **Supabase**: se usa el **pooler** regional `aws-0-sa-east-1.pooler.supabase.com:5432` porque el host directo no resuelve IPv4 en Render.
- **Env production**: `DATABASE_URL`, `JWT_SECRET`, `MP_ACCESS_TOKEN`, `NEXT_PUBLIC_API_URL` (burn-in en build-time), `API_BASE_URL`, `MERCADOPAGE_NOTIFICATION_URL`, `APIFY_TOKEN`, `SCRAPFLY_TOKEN`, `APIFY_CUOTA_MENSUAL`, `PRECIO_PASE_COLA`.

## Flujo Principal (Sorteo Público Online)

1. Usuario abre la web pública desde cualquier dispositivo (`sorteos-mvp-gratuito-nine.vercel.app`).
2. Pega la URL de la publicación (IG/TikTok/YT) → la web llama a `POST https://sorteos-api-y0dp.onrender.com/api/sorteos/analizar`.
3. La API hace scraping (Playwright en Render), detecta participantes y precio.
4. El usuario configura ganadores/suplentes (o pega participantes manuales) y sortea.
5. `POST /api/sorteos` → la API guarda el sorteo y los participantes en **Supabase PostgreSQL** y devuelve ganadores determinísticos con hash.
6. La web muestra los resultados con la ruleta animada.

## Variables de Entorno (Producción)

| Variable | Dónde | Uso |
|----------|-------|-----|
| `DATABASE_URL` | API (Render) | Conexión a Supabase Postgres pooler (Prisma) |
| `JWT_SECRET` | API | Firma de tokens (auth futura) |
| `MP_ACCESS_TOKEN` | API | Mercado Pago (token real pendiente) |
| `NEXT_PUBLIC_API_URL` | Web (Vercel) | URL pública de la API (`https://sorteos-api-y0dp.onrender.com`) |
| `API_BASE_URL` | API | Base pública de la API (webhooks MP) |
| `MERCADOPAGO_NOTIFICATION_URL` | API | URL de webhook de pagos |
| `APIFY_TOKEN` / `SCRAPFLY_TOKEN` | API | Actores externos de scraping (respaldo) |
| `APIFY_CUOTA_MENSUAL` | API | Cuota mensual de Apify (default 45) |
| `RATE_LIMIT` | API | Rate limiting configurable (default 100/15min) |

## Cambios en el Código (REALIZADOS)

### Backend (`api/`)
- `prisma/schema.prisma`: `provider = "postgresql"` (línea 6). ✅
- `.env` / `.env.production`: nueva `DATABASE_URL` (pooler). ✅
- `prisma/migrations/`: migración inicial aplicada en Supabase. ✅
- `lib/prisma.ts`: el singleton funciona igual en prod. ✅
- `Dockerfile`: `npm install --workspaces` (raíz) + `npx playwright install --with-deps chromium chrome` + `prisma generate` + `npm run build` + CMD `Xvfb :99 -screen 0 1280x1024x24 -ac` + `node dist/index.js`. ✅
- CORS en `src/index.ts`: permitidos `WEB_APP_URL`, `https://sorteos-mvp-gratuito-nine.vercel.app`, `localhost:3000`, `127.0.0.1:3000`. ✅

### Frontend (`web/`)
- Cliente API usa `NEXT_PUBLIC_API_URL` en lugar de `http://localhost:4000`. ✅
- Deploy automático desde GitHub a Vercel. ✅ (Ready en `sorteos-mvp-gratuito-nine.vercel.app`)
- `web/vercel.json` con `"framework": "nextjs"` para forzar detección en el monorepo. ✅

### Módulos compartidos
- `shared-modules/` subidas al repo de GitHub (incluido `seo`, antes ausente). ✅
- Monorepo npm workspaces en raíz (`api`, `web`, `shared-modules/*`) para el build en la nube. ✅

## Migración de Datos (Dev → Prod)

- Los datos de `dev.db` (local) **no se transfieren** por defecto: producción empieza limpio.
- Si se necesita llevar datos: exportar a SQL y cargar en Postgres (no crítico para MVP).

## Seguridad Básica en Producción

- HTTPS automático (Vercel/Render lo proveen).
- `CORS` restringido a los dominios de la web.
- Rate limiting básico en la API (evitar abuso del scraper).
- Secrets solo en variables de entorno (nunca en el repo; verificar que `.env` esté en `.gitignore`).
