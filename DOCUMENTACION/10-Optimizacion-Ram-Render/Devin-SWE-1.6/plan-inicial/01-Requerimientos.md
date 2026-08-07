# 01-Requerimientos - Módulo 10: Optimización RAM Render

**Autor:** Devin-SWE 1.6  
**Fecha:** 2026-08-07  
**Versión:** 1.0

## 1. Problema

### 1.1 Contexto del Problema
- **Plataforma:** Render free tier (512 MB RAM)
- **Aplicación:** Sistema de sorteos con extracción de comentarios de Instagram
- **Estrategia actual:** Estrategia G (Chrome real + scroll infinito anónimo)
- **Estado actual:** El contenedor arranca con 477/512 MB y muere por OOM durante scroll
- **Performance actual:** 99.2% de precisión con Chrome real visible, pero no funciona en 512 MB

### 1.2 Diagnóstico de la Memoria
El contenedor consume:
- **Estado visible + flags:** 484/512 MB (28 MB margen)
- **Estado headless sin Xvfb:** 477/512 MB (35 MB margen)
- **Causa del OOM:** Scroll infinito agrega DOM progresivamente hasta cruzar 512 MB
- **Momento del fallo:** 82-85 segundos después de iniciar el POST `/api/sorteos/analizar`

### 1.3 Optimizaciones Ya Probadas (Insuficientes)
- Bloqueo de imágenes/media/font: ~28 MB ahorrados
- Headless sin Xvfb: ~7 MB ahorrados
- Flags varios (`--no-zygote`, `--js-flags`, `--expose-gc`): <35 MB total
- **Resultado:** Todas las micro-optimizaciones dan <35 MB de margen, necesitamos >100 MB

## 2. Objetivos

### 2.1 Objetivo Principal
Crear una arquitectura de scraping que funcione dentro de los 512 MB del plan free de Render sin sacrificar significativamente la precisión de la Estrategia G.

### 2.2 Objetivos Específicos
1. **Reducción de memoria base:** Bajar el consumo de boot de 477 MB a <350 MB
2. **Control de crecimiento:** Limitar el crecimiento de memoria durante scroll a <50 MB
3. **Mantenimiento de precisión:** Conservar ≥95% de precisión de la Estrategia G actual
4. **Compatibilidad:** No romper el flujo local/visible (sesión con cookies)
5. **Monitoreo:** Implementar métricas de memoria en tiempo real

### 2.3 Métricas de Éxito
- ✅ Funciona en Render free (512 MB) sin OOM
- ✅ Precisión ≥95% comparado con Estrategia G visible
- ✅ Boot memory <350 MB
- ✅ Crecimiento de memoria durante scroll <50 MB
- ✅ Tiempo de ejecución <5 minutos para posts de hasta 3000 comentarios

## 3. Alcance

### 3.1 Incluye
- Nueva arquitectura de scraping basada en streaming
- Sistema de paginación de DOM (virtual scrolling)
- Optimización proactiva de garbage collection
- Sistema de micro-reciclado de componentes
- Monitoreo de memoria en tiempo real
- Integración con estrategia existente (fallback)
- Testing en local y Render free

### 3.2 Excluye
- Modificación de la Estrategia G visible (sesión con cookies)
- Cambios en el frontend
- Implementación de pagos (scope diferente)
- Migración a otras plataformas de hosting

## 4. Restricciones

### 4.1 Restricciones Técnicas
- **Límite de memoria:** 512 MB RAM (Render free)
- **Sin swap:** No hay swap disponible en Render free
- **Compatibilidad:** Debe funcionar con Docker + Playwright + Chrome
- **Backward compatibility:** No romper funcionalidad existente

### 4.2 Restricciones de Negocio
- **Costo:** Solución debe funcionar en plan free (sin costo adicional)
- **Precisión:** No sacrificar significativamente la calidad del scraping
- **Mantenimiento:** Código debe ser mantenible y documentado

### 4.3 Restricciones de Desarrollo
- **AGENTS.md:** Seguir todas las reglas del proyecto
- **Testing:** Implementar plan de testings profesional
- **Documentación:** Crear los 5 archivos obligatorios más 06-Plan-Testings.md
- **Logs:** Registrar todos los cambios según formato estándar

## 5. Suposiciones

### 5.1 Suposiciones Técnicas
- El problema principal es el crecimiento del DOM durante scroll infinito
- Playwright permite manipulación fina del ciclo de vida del navegador
- Chrome puede funcionar con menos memoria si se gestiona agresivamente
- La detección de Instagram puede mitigarse con técnicas anti-detección

### 5.2 Suposiciones de Datos
- Posts típicos: 150-300 comentarios (pequeños)
- Posts grandes: 2000-3000 comentarios (críticos)
- La mayoría de usuarios tienen posts pequeños (<500 comentarios)

## 6. Stakeholders

### 6.1 Usuarios Finales
- Usuarios del sistema de sorteos (influencers, marcas)
- Necesitan: Funcionalidad gratuita confiable

### 6.2 Desarrolladores
- Equipo de desarrollo del proyecto
- Necesitan: Código mantenible y bien documentado

### 6.3 Plataforma
- Render (hosting)
- Restricción: 512 MB RAM en plan free

## 7. Riesgos

### 7.1 Riesgos Técnicos
- **Riesgo alto:** La nueva arquitectura podría reducir significativamente la precisión
- **Riesgo medio:** Chrome podría no funcionar con memory limits tan agresivos
- **Riesgo medio:** Instagram podría detectar el comportamiento anti-detección

### 7.2 Riesgos de Negocio
- **Riesgo bajo:** La solución podría no ser suficiente y requerir plan pago
- **Riesgo bajo:** El tiempo de desarrollo podría extenderse más de lo esperado

### 7.3 Plan de Mitigación
- Implementar fallback a Estrategia G clásica si la nueva falla
- Testing exhaustivo en local antes de desplegar a Render
- Monitoreo continuo de métricas en producción
