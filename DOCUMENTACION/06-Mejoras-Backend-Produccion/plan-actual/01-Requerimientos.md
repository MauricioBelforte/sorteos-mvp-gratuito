# 01 - Requerimientos - Mejoras de Backend para Producción (Puesta Online Multiusuario)

## Problema

El sistema actual solo funciona **en local**:
- La base de datos es **SQLite** (un archivo local `api/prisma/dev.db`) → los datos viven solo en la máquina del desarrollador y no persisten en la nube.
- La web y la API corren en `localhost` (puertos 3000/4000) → **ninguna persona externa puede usarlas**.
- En un entorno serverless (ej: Vercel) el archivo SQLite es efímero y se perdería constantemente.

**Objetivo del usuario:** cualquier persona, desde cualquier lugar, debe poder entrar a la web y realizar un sorteo sin registrarse.

## Objetivos (Requerimientos del Usuario - OBLIGATORIOS)

1. **Puesta en producción de la web**: dominio público accesible desde cualquier dispositivo (HTTPS).
2. **Puesta en producción de la API**: la web debe consumir la API desde la nube (no localhost).
3. **Base de datos en la nube y persistente**: migrar de SQLite a **PostgreSQL** (los datos de usuarios, sorteos y participantes deben permanecer en el tiempo).
4. **Uso abierto sin registro**: cualquier visitante puede pegar una URL de publicación y sortear (el flujo actual sin auth debe mantenerse).
5. **Scraping en la nube**: el motor de scraping (Playwright) debe funcionar en el servidor de la API.
6. **Costos mínimos o cero**: priorizar free tiers (Supabase/Neon para DB, Vercel/Railway/Render para deploy).

## Alcance

- **Backend:** cambio de proveedor Prisma (`sqlite` → `postgresql`), nueva `DATABASE_URL` en la nube, migraciones aplicadas en producción, ajustes de configuración para el entorno de producción (CORS, variables de entorno, rate limiting básico).
- **Frontend:** apuntar el cliente API a la URL pública, configuración de deploy en Vercel.
- **Deploy:** web + API en plataformas gratuitas, verificación end-to-end en producción.
- **No incluye:** registro/login obligatorio, pasarela de pagos activa (Mercado Pago queda "próximamente"), multi-tenant con cuentas de pago, escalado horizontal.

## Restricciones

- **NO romper** el contrato actual de la API (POST `/api/sorteos`, POST `/api/sorteos/analizar`, etc.) ni el flujo de sorteos verificado.
- **NO modificar** los flujos estables (sección 16 de AGENTS.md).
- El sorteo debe seguir siendo **determinístico y verificable** con hash.
- Las credenciales (Mercado Pago, DB, JWT) deben ir en variables de entorno, nunca en el código.
- Documentar todo según AGENTS.md (plan-actual, logs, checklist).

## Criterios de Éxito

- Cualquier persona puede abrir la web pública y completar un sorteo de punta a punta.
- Los datos persisten entre sesiones/usuarios distintos (base en la nube).
- Build y deploy exitosos de web y API.
- Sin regresiones en el flujo local existente.
