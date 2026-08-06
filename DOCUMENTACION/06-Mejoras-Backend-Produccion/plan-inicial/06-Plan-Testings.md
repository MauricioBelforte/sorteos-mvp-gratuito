# 06 - Plan de Testings - Mejoras de Backend para Producción

> Plan diseñado para ejecutarse ANTES de dar por terminada la puesta en producción.

## Contexto

Las pruebas se ejecutan en dos entornos:
- **Local con Postgres**: la API corriendo en la máquina del dev conectada a la DB en la nube (validar la migración).
- **Producción**: web en Vercel + API en Render/Railway + DB en Supabase/Neon.

## Escenarios y Criterios de Éxito

### A. Migración a PostgreSQL (Local)
| ID | Escenario | Criterio de éxito |
|----|-----------|-------------------|
| A1 | `prisma migrate dev --name init` contra Postgres | Migración aplicada sin errores; tablas creadas en la DB de la nube |
| A2 | Registrar usuario (POST /api/auth/register) | Se crea fila en tabla `Usuario` con UUID y email único |
| A3 | Login y GET /api/auth/me | JWT válido, devuelve el usuario creado |
| A4 | Crear sorteo con participantes reales (YT) | Se guardan `Sorteo`, `Participante` (con comentario) y `Certificado` |
| A5 | Crear sorteo con participantes manuales | Mismo resultado que A4; 422 si no hay participantes |
| A6 | Listar sorteos | `findMany` devuelve los registros creados |

### B. Persistencia en la Nube
| ID | Escenario | Criterio de éxito |
|----|-----------|-------------------|
| B1 | Reiniciar la API local | Los datos siguen existiendo (la DB está en la nube, no en el archivo) |
| B2 | Revisar el panel de Supabase/Neon | Las tablas tienen las filas esperadas |
| B3 | Dos usuarios distintos usan la web | Ambos sorteos coexisten sin pisarse |

### C. Deploy de la API (Render/Railway)
| ID | Escenario | Criterio de éxito |
|----|-----------|-------------------|
| C1 | Deploy inicial | Build OK (instala Playwright, genera cliente Prisma, migra, arranca `npm start`) |
| C2 | Health check de la API | Endpoint responde 200 con HTTPS |
| C3 | Scraping de YouTube desde la API en la nube | `/api/sorteos/analizar` devuelve participantes reales |
| C4 | Scraping de Instagram/TikTok desde la nube | Devuelve participantes o error controlado (no crash) |
| C5 | CORS | La web pública puede llamar a la API sin error de CORS |
| C6 | Rate limiting | Más de N requests por minuto reciben 429 |

### D. Deploy de la Web (Vercel)
| ID | Escenario | Criterio de éxito |
|----|-----------|-------------------|
| D1 | Build en Vercel | Build OK, sin errores de SSR/hidratación |
| D2 | Carga de la home pública | Se renderiza correctamente desde cualquier dispositivo |
| D3 | Flujo completo en producción | Analizar → configurar → sortear → ver ganadores con comentario |

### E. Seguridad
| ID | Escenario | Criterio de éxito |
|----|-----------|-------------------|
| E1 | Revisar repo | No hay secretos (`.env` no está versionado; claves en variables de la plataforma) |
| E2 | HTTPS | Todos los endpoints públicos responden por HTTPS |

## Orden de Ejecución Sugerido

1. Bloque A (local + Postgres) → corregir fallos de migración
2. Bloque B (persistencia)
3. Bloque C (API en la nube)
4. Bloque D (web en producción)
5. Bloque E (seguridad)

## Registro de Resultados

Cada prueba ejecutada se documenta en `07-Resultados-Testings.md` con: ID, resultado (PASÓ/FALLÓ), evidencia y corrección aplicada.
