# 05 - Checklist - Mejoras de Backend para Producción

## Plan-inicial (Origen de la Idea)

- [x] Identificar el problema: sistema solo local (SQLite + localhost)
- [x] Definir el objetivo: cualquier persona puede entrar a la web y sortear
- [x] Elegir nombre del módulo: 06-Mejoras-Backend-Produccion
- [x] Documentar requerimientos, análisis, diseño, código y este checklist

## Pendientes (Se ejecutarán en futuras tareas)

### Base de Datos
- [ ] Crear proyecto PostgreSQL gratis (Supabase o Neon)
- [ ] Cambiar `provider = "postgresql"` en `api/prisma/schema.prisma`
- [ ] Actualizar `DATABASE_URL` en `.env` con la URL de la nube
- [ ] Generar migración inicial con `prisma migrate dev --name init`
- [ ] Verificar que todos los modelos (Usuario, Sorteo, Participante, Certificado) funcionan en Postgres
- [ ] Aplicar migraciones en producción (`prisma migrate deploy`)

### API (Deploy)
- [ ] Subir el repo a GitHub (incluyendo shared-modules o empaquetarlas)
- [ ] Crear servicio Node en Render/Railway conectado al repo
- [ ] Configurar variables de entorno (DATABASE_URL, JWT_SECRET, MP_ACCESS_TOKEN)
- [ ] Instalar Playwright en el entorno de build (`npx playwright install --with-deps chromium`)
- [ ] Ajustar CORS en `api/src/index.ts` para el dominio de la web
- [ ] Agregar rate limiting básico a los endpoints públicos
- [ ] Verificar que el scraping funciona desde la API en la nube

### Web (Deploy)
- [ ] Configurar `NEXT_PUBLIC_API_URL` apuntando a la API pública
- [ ] Crear proyecto en Vercel conectado al repo (carpeta `web/`)
- [ ] Verificar build en Vercel (SSR, hidratación)
- [ ] Configurar dominio propio (opcional)

### Verificación End-to-End en Producción
- [ ] Abrir la web pública desde otro dispositivo
- [ ] Sortear con una publicación real (IG/TikTok/YT)
- [ ] Sortear con participantes manuales
- [ ] Confirmar que los datos persisten (recargar, esperar, verificar en Supabase)
- [ ] Ejecutar plan de testings (06-Plan-Testings.md) y documentar resultados (07)

## Estado

- [x] Documentación creada
- [ ] Implementación completada
- [ ] Testings completados
