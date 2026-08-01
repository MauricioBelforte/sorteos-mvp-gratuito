# Documento de Especificaciones - MVP Sorteos Gratuitos

## 1. Descripción General

**Nombre del Proyecto:** MVP Sorteos Gratuitos  
**Versión:** 1.0.0  
**Fecha de Creación:** 01/08/2026  
**Estado:** Desarrollo Activo

Sistema de sorteos gratuito paralelo a la versión completa, enfocado en Latinoamérica, utilizando scraping para recolectar comentarios de redes sociales (Instagram, TikTok, YouTube) y pagos por uso con Mercado Pago.

## 2. Objetivos del Proyecto

### 2.1 Objetivos Principales
- Crear una versión simplificada y gratuita del sistema de sorteos
- Implementar scraping de comentarios sin usar APIs de pago
- Integrar pagos por uso simples con Mercado Pago
- Implementar SEO técnico optimizado para Latinoamérica
- Crear módulos reutilizables para migrar a la versión completa

### 2.2 Objetivos Secundarios
- Validar la arquitectura de módulos reutilizables
- Probar estrategia SEO en Latinoamérica
- Validar modelo de pago por uso
- Crear base para expansión futura

## 3. Alcance del Proyecto

### 3.1 Funcionalidades Incluidas
- **Backend API:**
  - Autenticación JWT (registro, login, /me)
  - Creación de sorteos con scraping
  - Límite de 3 sorteos/mes por usuario (plan free)
  - Motor de sorteos determinístico
  - Sistema de verificación con hash
  - Integración de pagos Mercado Pago
  - Webhooks de Mercado Pago

- **Frontend Web:**
  - Página de registro
  - Página de login
  - Dashboard de usuario
  - Página de detalle de sorteo
  - Integración de SEO técnico

- **Módulos Reutilizables:**
  - Módulo SEO técnico (meta tags, sitemap, robots.txt, structured data)
  - Módulo Mercado Pago (pago por uso, webhooks)

### 3.2 Funcionalidades Excluidas (Reservadas para versión completa)
- Twitter API (requiere pago)
- Facebook API (requiere pago)
- Planes de suscripción mensuales
- Sistema de analytics avanzado
- Integraciones con servicios de terceros adicionales

## 4. Tecnologías y Stack Tecnológico

### 4.1 Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **ORM:** Prisma
- **Base de Datos:** SQLite (desarrollo) / PostgreSQL (producción con Supabase)
- **Scraping:** Playwright
- **Autenticación:** JWT + bcrypt
- **Pagos:** Mercado Pago SDK

### 4.2 Frontend
- **Framework:** Next.js 14
- **UI:** React 18
- **Lenguaje:** TypeScript
- **Estilos:** CSS (sin framework por simplicidad)

### 4.3 Módulos Compartidos
- **SEO:** TypeScript puro
- **Mercado Pago:** TypeScript + SDK oficial

## 5. Requisitos Funcionales

### 5.1 Autenticación
- RF-01: Usuario debe poder registrarse con email, contraseña y nombre
- RF-02: Usuario debe poder iniciar sesión con email y contraseña
- RF-03: Sistema debe generar token JWT válido
- RF-04: Token debe expirar después de 24 horas
- RF-05: Contraseñas deben ser hasheadas con bcrypt

### 5.2 Sorteos
- RF-06: Usuario debe poder crear sorteos con título, URL de publicación y red social
- RF-07: Sistema debe recolectar comentarios de Instagram/TikTok/YouTube
- RF-08: Sistema debe seleccionar ganadores de forma determinística
- RF-09: Sistema debe generar hash de verificación
- RF-10: Usuario debe poder ver sus sorteos en dashboard
- RF-11: Usuario debe poder ver detalle de un sorteo específico
- RF-12: Sistema debe limitar a 3 sorteos por mes por usuario (plan free)

### 5.3 Pagos
- RF-13: Usuario debe poder pagar por sorteo individual
- RF-14: Sistema debe crear preferencia de pago en Mercado Pago
- RF-15: Sistema debe recibir webhooks de Mercado Pago
- RF-16: Sistema debe verificar firma de webhooks
- RF-17: Precio por sorteo: 100 ARS (configurable)

### 5.4 SEO
- RF-18: Sistema debe generar meta tags optimizados
- RF-19: Sistema debe soportar múltiples locales de Latinoamérica
- RF-20: Sistema debe generar structured data para Schema.org

## 6. Requisitos No Funcionales

### 6.1 Performance
- RNF-01: API debe responder en menos de 500ms para endpoints de autenticación
- RNF-02: Scraping debe completarse en menos de 30 segundos
- RNF-03: Frontend debe cargar en menos de 2 segundos

### 6.2 Seguridad
- RNF-04: Todas las rutas excepto login/register deben requerir autenticación
- RNF-05: Webhooks de Mercado Pago deben verificar firma
- RNF-06: Contraseñas deben tener mínimo 6 caracteres
- RNF-07: Tokens JWT deben ser secretos y rotar periódicamente

### 6.3 Escalabilidad
- RNF-08: Arquitectura debe permitir migración a PostgreSQL
- RNF-09: Módulos deben ser reutilizables en versión completa
- RNF-10: Sistema debe soportar múltiples usuarios concurrentes

### 6.4 Mantenibilidad
- RNF-11: Código debe estar documentado
- RNF-12: Sistema debe seguir estructura de carpetas definida
- RNF-13: Logs deben registrarse en carpeta Logs/
- RNF-14: Cambios deben documentarse en DOCUMENTACION/

## 7. Restricciones

### 7.1 Restricciones Técnicas
- No usar APIs de pago (Twitter, Facebook)
- Usar solo scraping para recolección de comentarios
- Base de datos SQLite para desarrollo local
- Solo redes sociales: Instagram, TikTok, YouTube

### 7.2 Restricciones de Negocio
- Plan free limitado a 3 sorteos por mes
- Pago por uso obligatorio para sorteos adicionales
- Solo mercado latinoamericano
- Idioma español

### 7.3 Restricciones de Documentación
- Seguir estructura definida en AGENTS.md
- Documentar todos los cambios en Logs/
- Actualizar DOCUMENTACION/ con cada cambio significativo

## 8. Puntos de Integración

### 8.1 Integraciones Externas
- **Mercado Pago:** API de pagos y webhooks
- **Supabase:** Base de datos PostgreSQL (producción)
- **Upstash:** Redis (producción, opcional)

### 8.2 Módulos Reutilizables
- **@shared/seo:** Módulo de SEO técnico
- **@shared/mercadopago:** Módulo de pagos Mercado Pago

## 9. Métricas de Éxito

- KPI-01: Tiempo de creación de sorteo < 1 minuto
- KPI-02: Tasa de éxito de scraping > 80%
- KPI-03: Tasa de conversión de pagos > 50%
- KPI-04: Posicionamiento SEO en primeros resultados (Latinoamérica)

## 10. Roadmap de Desarrollo

### Fase 1 (Completada)
- ✅ Estructura de carpetas
- ✅ Backend API básico
- ✅ Frontend básico
- ✅ Scraping de redes sociales

### Fase 2 (Completada)
- ✅ Módulo SEO reutilizable
- ✅ Módulo Mercado Pago reutilizable
- ✅ Integración de módulos en MVP

### Fase 3 (Pendiente)
- ⏳ Testing completo
- ⏳ Deploy en Vercel
- ⏳ Configuración de Supabase
- ⏳ Configuración de Upstash

### Fase 4 (Pendiente)
- ⏳ Migración a versión completa si estrategia exitosa
- ⏳ Optimización SEO
- ⏳ Expansión de funcionalidades
