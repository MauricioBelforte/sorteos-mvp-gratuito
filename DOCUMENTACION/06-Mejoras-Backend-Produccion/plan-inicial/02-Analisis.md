# 02 - Análisis - Mejoras de Backend para Producción

## Análisis del Dominio

### Problema central
- SQLite = archivo local: imposible de usar como DB compartida online (no soporta acceso remoto concurrente multiusuario).
- Playwright (scraping de IG/TikTok/YT) necesita un entorno con navegador real → Vercel (serverless) NO es apto para la API.
- Las dependencias locales `file:../../shared-modules/...` deben estar disponibles en el entorno de build de la nube.

## Alternativas Consideradas

### 1. Base de datos en la nube
| Opción | Costo | Pros | Contras |
|--------|-------|------|---------|
| **Supabase Postgres** | Gratis (500 MB) | Panel visual, backup automático, auth opcional | Region fija |
| **Neon Postgres** | Gratis (0.5 GB) | Serverless, branching, auto-pause | Conexión fría |
| **Railway Postgres** | Gratis limitado | Simple, mismo host que la API | El free tier puede ser efímero |
| **VPS propio** | Pago | Control total | Mantenimiento |

**Decisión propuesta:** Supabase (o Neon) como primera opción por free tier con respaldo automático y panel web.

### 2. Hosting de la API (Express + Playwright)
| Opción | Costo | Pros | Contras |
|--------|-------|------|---------|
| **Railway** | Free tier | Soporta apps Node con disco y procesos largos | Free tier con límites de uso |
| **Render (Web Service)** | Free tier | Fácil, spawn gratis, se duerme con inactividad | 50h/mes gratis, arranque lento |
| **Fly.io** | Free tier limitado | VMs con volumen persistente | Curva de aprendizaje |

**Decisión propuesta:** Render o Railway para la API (necesita proceso persistente + navegador). **No usar Vercel para la API** por el límite de funciones serverless (sin Playwright).

### 3. Hosting de la web (Next.js)
| Opción | Costo | Pros |
|--------|-------|-----|
| **Vercel** | Gratis | Deploy automático desde GitHub, HTTPS, CDN, ideal para Next.js |

**Decisión propuesta:** Vercel para la web.

### 4. Migración SQLite → PostgreSQL con Prisma
- Cambiar `provider` en `schema.prisma` de `sqlite` a `postgresql`.
- El esquema actual usa UUIDs y tipos compatibles → migración directa con `prisma migrate` (recomendado sobre `db push` para producción).
- Considerar: datos actuales de dev.db NO se migran (es solo desarrollo); se puede iniciar limpio o usar `pgloader` si hiciera falta.
- El campo `comentario` y los arrays JSON (`ganadores`, `suplentes` como String) son compatibles con Postgres.

## Decisiones Tomadas (Iniciales)

1. **DB:** PostgreSQL en la nube (Supabase/Neon) con Prisma.
2. **API:** Render o Railway (proceso Node + Playwright).
3. **Web:** Vercel (Next.js).
4. **Sin auth obligatorio:** el flujo público de sorteo se mantiene sin login.
5. **Secrets:** todas las claves en variables de entorno de cada plataforma.

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Playwright no instala navegadores en la nube | Script de build/install (`npx playwright install`) en el deploy |
| Free tier se duerme (Render) | El arranque puede tardar ~50s; aceptable para MVP, avisar en UI |
| IP de la API bloqueada por IG/TikTok | Aceptable para MVP; monitorear errores de scraping |
| Costos ocultos al crecer | Monitorear uso; el MVP no requiere escala |
