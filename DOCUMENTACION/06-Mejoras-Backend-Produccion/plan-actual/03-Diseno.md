# 03 - Diseño - Mejoras de Backend para Producción

## Arquitectura Objetivo

```
[ Usuario final (cualquier persona) ]
                │
                ▼  HTTPS
        [ Web Next.js 14 — Vercel ]        ← dominio público (ej: sorteos-mvp.vercel.app)
                │
                │  /api/* (fetch)
                ▼
      [ API Express — Render/Railway ]      ← proceso Node persistente + Playwright
                │
                ▼  Prisma (PostgreSQL)
        [ Supabase/Neon Postgres ]          ← datos persistentes en la nube
```

## Flujo Principal (Sorteo Público Online)

1. Usuario abre la web pública desde cualquier dispositivo.
2. Pega la URL de la publicación (IG/TikTok/YT) → la web llama a `POST https://api-publica/api/sorteos/analizar`.
3. La API hace scraping (Playwright en la nube), detecta participantes y precio.
4. El usuario configura ganadores/suplentes (o pega participantes manuales) y sortea.
5. `POST /api/sorteos` → la API guarda el sorteo y los participantes en **PostgreSQL** y devuelve ganadores determinísticos con hash.
6. La web muestra los resultados con la ruleta animada.

## Variables de Entorno (Producción)

| Variable | Dónde | Uso |
|----------|-------|-----|
| `DATABASE_URL` | Supabase/Neon | Conexión a Postgres (Prisma) |
| `JWT_SECRET` | API | Firma de tokens (auth futura) |
| `MP_ACCESS_TOKEN` | API | Mercado Pago (próximamente) |
| `NEXT_PUBLIC_API_URL` | Web | URL pública de la API |

## Cambios en el Código (Previstos)

### Backend (`api/`)
- `prisma/schema.prisma`: `provider = "postgresql"` (línea 6).
- `.env` / `.env.production`: nueva `DATABASE_URL`.
- `prisma/migrations/`: generar migración inicial (`prisma migrate dev --name init`).
- Verificar `lib/prisma.ts`: el singleton actual funciona igual en prod.
- Posible `Dockerfile` o script `build` en la plataforma: `npm install` + `npx playwright install --with-deps chromium` + `prisma generate` + `prisma migrate deploy` + `npm run build` + `npm start`.
- Revisar CORS en `src/index.ts`: permitir el dominio de la web.

### Frontend (`web/`)
- Cliente API: usar `NEXT_PUBLIC_API_URL` en lugar de `http://localhost:4000`.
- Verificar SSR/hidratación en producción.
- Deploy automático desde GitHub a Vercel.

### Módulos compartidos
- `shared-modules/`: deben subirse al repo de GitHub (o publicarse) para que el build en la nube los resuelva (`file:../../shared-modules/...`).

## Migración de Datos (Dev → Prod)

- Los datos de `dev.db` (local) **no se transfieren** por defecto: producción empieza limpio.
- Si se necesita llevar datos: exportar a SQL y cargar en Postgres (no crítico para MVP).

## Seguridad Básica en Producción

- HTTPS automático (Vercel/Render lo proveen).
- `CORS` restringido a los dominios de la web.
- Rate limiting básico en la API (evitar abuso del scraper).
- Secrets solo en variables de entorno (nunca en el repo; verificar que `.env` esté en `.gitignore`).
