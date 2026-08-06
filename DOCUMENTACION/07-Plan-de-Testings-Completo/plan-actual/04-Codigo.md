# Código — Plan de Testings Profesional Completo

**Componente:** 07-Plan-de-Testings-Completo  
**Fecha:** 2026-08-04  
**Responsable:** glm + DeepSeek (Cline)

---

## Archivos Involucrados

### Script de Pruebas

| Archivo | Descripción |
|---------|-------------|
| `api/tests/unit-smoke-test.mjs` | Script autocontenido con 55 pruebas unitarias y de smoke |

### Archivos Testeados (funciones copiadas)

| Archivo Fuente | Funciones Testeadas |
|----------------|---------------------|
| `api/src/lib/verificacion.ts` | `generarHashParticipantes`, `generarHashVerificacion`, `crearPRNG`, `seleccionarSinRepeticion`, `realizarSorteo`, `verificarSorteo` |
| `api/src/lib/sorteos-service.ts` | `calcularPrecio`, `deduplicarParticipantes` |
| `api/src/collectors/parsers/instagram-paste.ts` | `parsearParticipantesManuales` (copia aproximada) |

### Archivos Analizados (análisis estático con subagents)

| Archivo | Bugs Encontrados |
|---------|-----------------|
| `api/src/index.ts` | B-01 (CORS), B-02 (race condition), B-03 (rate limiting), B-05 (body size), B-06 (error handler), B-07 (helmet) |
| `api/src/routes/sorteos.ts` | Validaciones de endpoints |
| `api/src/routes/preview.ts` | Validaciones de endpoints |
| `api/src/routes/pagos.ts` | Validaciones de endpoints |
| `api/src/routes/instagram.ts` | Validaciones de endpoints |
| `api/src/lib/sorteos-service.ts` | B-09 (deduplicación) |
| `api/src/lib/cuota.ts` | Lógica de cuota |
| `api/src/lib/cola.ts` | Race condition |
| `api/src/lib/pases.ts` | Validación de pases |
| `api/src/lib/verificacion.ts` | Motor de sorteos (OK) |
| `api/src/collectors/instagram-v2.ts` | B-10, B-11, B-12 |
| `api/src/collectors/youtube.ts` | Collector YouTube |
| `api/src/collectors/tiktok.ts` | Collector TikTok |
| `api/src/collectors/parsers/instagram-paste.ts` | Parser manual |
| `api/src/collectors/strategies/scroll-anon-completo.ts` | Estrategia G |
| `api/src/collectors/strategies/external-service.ts` | Apify |
| `api/prisma/schema.prisma` | Modelos de DB |
| `web/app/page.tsx` | B-13 (contraste) |
| `web/app/layout.tsx` | B-08 (metadataBase), B-14 (imports muertos) |
| `web/app/pago/page.tsx` | B-04 (TypeError null) |
| `web/components/features/SorteoWizard.tsx` | Wizard de sorteo |
| `web/components/features/RuletaGanadores.tsx` | Animación de ruleta |
| `web/components/features/ResultCard.tsx` | Card de resultados |
| `web/lib/sorteos.ts` | Funciones de API |
| `web/lib/api.ts` | Cliente HTTP |
| `shared-modules/mercadopago/src/payment.ts` | Pagos MP |
| `shared-modules/mercadopago/src/client.ts` | Cliente MP |

## Logs Relacionados

- `Logs/29-Plan-Testings-Profesional-Completo-2026-08-04_21-15-00.md` (este componente)