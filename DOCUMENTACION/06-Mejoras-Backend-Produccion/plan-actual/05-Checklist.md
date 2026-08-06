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
- [x] Agregar campo "Session ID" en el wizard → recolección headless autenticada (sin Chrome ni Apify; vía de sesión para la nube)
- [x] Verificado con sesión real: la Estrategia G sube de ~141 anónimo a **213 únicos** (Log 30); el 254 del contador no se expone públicamente (API REST máx. 15, GraphQL solo feed)
- [x] Fix extracción de replies (Log 33): `extraerParesDOM` elige el ancestro MÁS LARGO con ≤4 perfiles (antes cortaba en el header nombre+timestamp) → recupera los 15 de `liliianaelizabethsarti` "inseguridad y falta de agua"
- [x] Fix falso positivo de basura (Log 33): se quitan menciones `@usuario` antes del chequeo `esBasura` (el username `noel**api**cone` contenía "api") → recupera 3 de `@noeliapicone` + 1 de `@papichamp`
- [x] Techo final con sesión: **235/237 comentarios visibles (99.2%)** en `Cm7p75TJVub`; los 2 restantes son menciones truncadas (`@gustavo.pedro.148`, `@gustavodiaz2580`) que IG no renderiza completas en el DOM web
- [x] E2E confirmado por endpoint real (Log 34): `POST /api/sorteos/analizar` con sesión guardada → 234 participantes deduplicados; 232/232 comentarios visibles del usuario capturados (1 sin match = caption del autor, excluido por diseño); 235 del diag pierde 1 por dedupe `usuario|comentario`
- [ ] Verificar que el scraping funciona desde la API en la nube
- [ ] Evaluar Estrategia G en nube: instalar Chrome real (`google-chrome-stable`) + `xvfb` en el Dockerfile de Render (la G depende del binario Chrome, no del display); si IG la detecta, usar Apify con `sessionid` como fuente primaria

### Monetización Nube: Cuota Apify + Cola + Pase Rápido (Log 23)
- [x] Modelos `CuotaApify` (mes @unique, usos) y `SolicitudCola` en schema + migración SQL aplicada (UTF-8)
- [x] `lib/cuota.ts`: cuota mensual dinámica (`ceil(restantes/días)`), `CuotaAgotadaError`, `registrarUsoApify()` (solo tras run exitoso del actor)
- [x] `lib/cola.ts`: `entrarEnCola`, `estadoCola` (posición FIFO + disponibleEn), `procesarCola` (job cada 5 min en `index.ts`)
- [x] `lib/sorteos-service.ts`: lógica del sorteo extraída de la ruta + `respuestaCuotaAgotada()` (402: motivo 'cuota', $2500 ARS)
- [x] Flag `paseAprobado` propagado: rutas → collectors → `external-service.ts` (chequeo de cuota antes del run, registro de uso después)
- [x] Endpoints `GET /api/sorteos/cuota`, `POST /api/sorteos/cola`, `GET /api/sorteos/cola/:id`
- [x] Frontend: barra de cuota, pantalla de cuota agotada (Pase Rápido vs cola), vista de cola con polling 10 s y resultado final
- [x] Variables `APIFY_CUOTA_MENSUAL=45` y `PRECIO_PASE_COLA=2500` en `.env` y `.env.example`
- [x] E2E verificado: cuota agotada → 402 requierePago; cola → job → sorteo completado (139 participantes, ganador + hash)
- [ ] Pago real del Pase Rápido con MercadoPago (hoy simbólico; resolver import `@shared/mercadopago` en `routes/pagos.ts`)
- [ ] Prueba visual manual del usuario en navegador (pantalla de cuota agotada + cola + pase)

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
