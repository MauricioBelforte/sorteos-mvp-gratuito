**Modelo:** Cascade
**Fecha:** 2026-08-01 18:50:00
**Responde a:** N/A (mensaje inicial de contexto)

# Contexto Actual del Proyecto - MVP Sorteos Gratuitos

## Estado del Proyecto
El MVP de sorteos gratuitos está en estado de desarrollo activo. Se ha realizado un cambio importante en el modelo de negocio.

## Cambio de Modelo Reciente (01/08/2026 18:38:00)

### Cambios Implementados
1. **Eliminada autenticación obligatoria** del MVP
   - Ahora los sorteos se pueden crear sin iniciar sesión
   - El código de autenticación se mantiene para implementación futura

2. **Implementado modelo de precios por cantidad de comentarios**
   - 0-1000 comentarios: Gratis ($0 ARS)
   - 1001-2000 comentarios: $5,000 ARS
   - 2001-3000 comentarios: $6,000 ARS
   - 3001-10000 comentarios: $10,000 ARS
   - +10000 comentarios: $10,000 + $1,000 por cada 1000 adicionales

3. **Simplificado flujo de usuario**
   - Solo pegar URL de publicación para crear sorteo
   - Detección automática de red social (Instagram, TikTok, YouTube)
   - Visualización de precios en la home

### Archivos Modificados
- `api/src/routes/sorteos.ts` - Eliminado auth obligatorio, agregado modelo de precios
- `web/app/page.tsx` - Simplificada home, eliminadas páginas de auth
- `api/prisma/schema.prisma` - usuarioId nullable

## Estado de Componentes

### Backend API
- ✅ Express.js configurado
- ✅ Prisma con SQLite
- ✅ Motor de sorteos determinístico
- ✅ Scraping de Instagram, TikTok, YouTube
- ✅ Modelo de precios implementado
- ✅ Autenticación JWT (mantenida para futuro)
- ✅ Integración Mercado Pago (mantenida para futuro)

### Frontend Web
- ✅ Next.js 14 configurado
- ✅ Página home simplificada (solo pegar URL)
- ✅ Detección automática de red social
- ✅ Visualización de precios
- ✅ Integración SEO técnico
- ✅ Páginas de auth (mantenidas para futuro)

### Módulos Reutilizables
- ✅ Módulo SEO técnico compilado
- ✅ Módulo Mercado Pago compilado

### Documentación
- ✅ Estructura DOCUMENTACION/ completa
- ✅ 4 documentos principales actualizados
- ✅ Documentación de componentes actualizada (plan-actual/)
- ✅ Logs/ con sistema de numeración
- ✅ Mensajes entre modelos/ con estado actual

## Próximos Pasos Sugeridos

### Prioridad Alta
1. **Testing del nuevo modelo**
   - Probar creación de sorteos sin auth
   - Verificar cálculo de precios
   - Probar detección automática de red social
   - Test con URLs reales de Instagram/TikTok/YouTube

2. **Implementación de pagos**
   - Integrar pagos Mercado Pago para sorteos con costo
   - Implementar flujo de checkout
   - Implementar webhooks
   - Test en sandbox de Mercado Pago

### Prioridad Media
3. **Deploy en producción**
   - Configurar Supabase (PostgreSQL)
   - Configurar Vercel (frontend)
   - Migrar schema de SQLite a PostgreSQL
   - Configurar variables de entorno producción

4. **Optimizaciones**
   - Optimizar tiempos de scraping
   - Implementar caché de comentarios
   - Mejorar UX/UI

## Notas Importantes

- La autenticación se mantiene en el código para implementación futura
- Los pagos se mantienen en el código para implementación futura
- El MVP está listo para ser probado con el nuevo modelo simplificado
- La documentación está completa y sigue AGENTS.md
- Los servidores de desarrollo están corriendo (backend: 4000, frontend: 3000)

## Servidores Corriendo
- **Backend API:** http://localhost:4000
- **Frontend Web:** http://localhost:3000

## Documentación de Referencia
- `DOCUMENTACION/1-DOCUMENTO-DE-ESPECIFICACIONES-ACTUAL.md` - Especificaciones actualizadas
- `DOCUMENTACION/2-DOCUMENTO-DISENO-ACTUAL.md` - Diseño actualizado
- `DOCUMENTACION/3-DOCUMENTO-TAREAS-ACTUAL.md` - Tareas actualizadas
- `DOCUMENTACION/4-DOCUMENTO-EJECUCION-ACTUAL.md` - Ejecución actualizada
- `Logs/02-Cambio-Modelo-Eliminar-Auth-Implementar-Precios-2026-08-01_18-38-00.md` - Log de cambios
- `Mensajes entre modelos/ESTADO-PARALELO.md` - Estado actual del proyecto

## Instrucciones para Continuar
1. Revisar la documentación actualizada
2. Probar el nuevo modelo de negocio
3. Implementar pagos para sorteos con costo
4. Ejecutar plan de testings
5. Preparar deploy en producción

El proyecto está en buen estado para continuar con testing e implementación de pagos.
