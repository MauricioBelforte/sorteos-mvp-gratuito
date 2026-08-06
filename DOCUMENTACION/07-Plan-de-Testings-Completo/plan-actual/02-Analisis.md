# Análisis — Plan de Testings Profesional Completo

**Componente:** 07-Plan-de-Testings-Completo  
**Fecha:** 2026-08-04  
**Responsable:** glm + DeepSeek (Cline)

---

## Análisis del Dominio

El sistema Sorteosypromos es una aplicación web para realizar sorteos basados en comentarios de redes sociales (Instagram, YouTube, TikTok). El flujo principal es:

1. Usuario pega URL de publicación
2. Sistema analiza la publicación (scraping de comentarios)
3. Sistema muestra preview (imagen + cantidad de comentarios)
4. Usuario configura ganadores/suplentes
5. Sistema sortea (motor determinístico con hash de verificación)

## Estado de Testings Anteriores

| Componente | Pruebas Planificadas | Pruebas Ejecutadas | Método |
|------------|---------------------|-------------------|--------|
| 01-Backend-API | 18 | 0 (solo estático) | Análisis de código |
| 02-Frontend-Web | ~10 | 0 (solo estático) | Análisis de código |
| 05-Mejoras-UI | ~8 | 0 (solo build) | Build + renderizado |
| 06-Mejoras-Backend-Produccion | ~10 | 0 | No ejecutadas |

**Conclusión:** Ningún componente tenía pruebas reales ejecutadas. Todas eran análisis estáticos.

## Decisiones de Testing

1. **Script autocontenido:** Se creó `api/tests/unit-smoke-test.mjs` con funciones copiadas de los archivos fuente para evitar dependencias externas (Prisma, Playwright) al ejecutar pruebas
2. **5 niveles de testing:** Compilación, Unitarias, Integración, Edge Cases, Smoke/Seguridad
3. **Análisis estático con subagents:** Se usaron 4 subagents para analizar el código en busca de bugs
4. **Pruebas de rendimiento:** Se incluyeron mediciones de tiempo para sorteo, deduplicación y hash

## Alternativas Consideradas

| Alternativa | Pros | Contras | Decisión |
|-------------|------|---------|----------|
| Jest/Vitest | Framework completo | Requiere instalación + config | ❌ (futuro) |
| Script Node.js autocontenido | Sin dependencias, rápido | Funciones copiadas | ✅ Elegida |
| Supertest para API | Prueba endpoints reales | Requiere servidor corriendo | ⏳ (futuro) |
| Playwright para E2E | Prueba flujos completos | Requiere navegador | ⏳ (futuro) |