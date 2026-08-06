# Checklist - Backend API

## Tareas Completadas

### Configuración Inicial
- [x] Configurar Express.js
- [x] Configurar Prisma con SQLite
- [x] Configurar TypeScript
- [x] Configurar variables de entorno
- [x] Instalar dependencias

### Autenticación (IMPLEMENTACIÓN FUTURA)
- [x] Implementar sistema de JWT
- [x] Implementar hashing con bcrypt
- [x] Crear rutas de auth (register, login, /me)
- [x] Implementar middleware de autenticación
- [x] Corregir errores de TypeScript en rutas

### Sorteos
- [x] Implementar motor de sorteos determinístico
- [x] Implementar sistema de verificación con hash
- [x] Crear rutas de sorteos (crear, listar, obtener) SIN AUTH
- [x] Eliminar límite de 3 sorteos por mes
- [x] Implementar modelo de precios por cantidad de comentarios
- [x] Hacer usuarioId nullable en schema de Prisma
- [x] Corregir error de skipDuplicates para SQLite

### Scraping
- [x] Implementar scraping de Instagram con Playwright
- [x] Implementar scraping de TikTok con Playwright
- [x] Implementar scraping de YouTube con Playwright
- [x] Crear exportador de collectors
- [x] Corregir errores de TypeScript en collectors

### Pagos
- [x] Integrar módulo Mercado Pago
- [x] Crear rutas de pagos (checkout, webhook)
- [x] Implementar verificación de webhooks
- [x] Configurar variables de entorno Mercado Pago
- [x] Instalar dependencias de módulo

## Tareas Pendientes

### Testing
- [ ] Crear plan de testings
- [ ] Ejecutar tests unitarios
- [ ] Ejecutar tests de integración
- [ ] Ejecutar tests de edge cases
- [ ] Documentar resultados de tests

### Optimización
- [ ] Optimizar tiempos de scraping
- [ ] Implementar caché de comentarios
- [ ] Optimizar queries de Prisma

### Producción
- [ ] Configurar Supabase
- [ ] Migrar schema a PostgreSQL
- [ ] Configurar variables de entorno producción
- [ ] Deploy en producción

## Estado General
**Completado:** 80%  
**Pendiente:** 20%  
**Bloqueadores:** Ninguno
