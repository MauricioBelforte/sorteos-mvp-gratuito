# Sorteosypromos

Realiza tu sorteo hasta 1000 comentarios gratis. Herramienta de sorteos y promociones para Instagram, TikTok y YouTube.

## Estructura Principal

### Documentación General (Raíz de DOCUMENTACION/)

Estos 4 archivos reflejan el estado actual del sistema y se actualizan durante el desarrollo:

| Archivo | Contenido | Estado |
|---------|-----------|--------|
| `1-DOCUMENTO-DE-ESPECIFICACIONES-ACTUAL.md` | Especificaciones técnicas vigentes | ✅ Creado |
| `2-DOCUMENTO-DISENO-ACTUAL.md` | Diseño detallado vigente | ✅ Creado |
| `3-DOCUMENTO-TAREAS-ACTUAL.md` | Checklist de tareas con estado actual | ✅ Creado |
| `4-DOCUMENTO-EJECUCION-ACTUAL.md` | Código de ejecución vigente | ✅ Creado |

### Plan Inicial

Carpeta `DOCUMENTACION/Plan Inicial/` contiene la documentación original del proyecto. **No refleja el estado actual del código.** Solo debe consultarse como referencia histórica. ⚠️ No debe modificarse.

### Documentación por Componentes

Cada componente agregado al sistema se documenta en una subcarpeta numerada cronológicamente:

```
DOCUMENTACION/
├── README.md
├── 1-DOCUMENTO-DE-ESPECIFICACIONES-ACTUAL.md
├── 2-DOCUMENTO-DISENO-ACTUAL.md
├── 3-DOCUMENTO-TAREAS-ACTUAL.md
├── 4-DOCUMENTO-EJECUCION-ACTUAL.md
├── Plan Inicial/
├── 01-Backend-API/
│   ├── plan-inicial/
│   └── plan-actual/
├── 02-Frontend-Web/
│   ├── plan-inicial/
│   └── plan-actual/
├── 03-Modulo-SEO/
│   ├── plan-inicial/
│   └── plan-actual/
├── 04-Modulo-MercadoPago/
│   ├── plan-inicial/
│   └── plan-actual/
├── 05-Mejoras-UI/
│   ├── plan-inicial/
│   └── plan-actual/
├── 06-Mejoras-Backend-Produccion/
│   ├── plan-inicial/
│   └── plan-actual/
├── 07-Plan-de-Testings-Completo/
│   ├── plan-inicial/
│   └── plan-actual/
├── 08-Testing-Seguridad/
│   ├── plan-inicial/
│   └── plan-actual/
├── 09-Pruebas-Extraccion-IG/
├── 10-Optimizacion-Ram-Render/
│   ├── plan-inicial/
│   └── plan-actual/
```

## Archivos Obligatorios por Componente

Cada carpeta (`plan-inicial/` y `plan-actual/`) contiene estos archivos:

| Archivo | Contenido |
|---------|-----------|
| `01-Requerimientos.md` | Problema, objetivos, alcance, restricciones |
| `02-Analisis.md` | Análisis del dominio, alternativas, decisiones |
| `03-Diseno.md` | Arquitectura, diagramas, flujos |
| `04-Codigo.md` | Archivos involucrados, funciones clave, logs relacionados |
| `05-Checklist.md` | Checklist de tareas completadas y pendientes |
| `06-Plan-Testings.md` | Plan de testings profesional |
| `07-Resultados-Testings.md` | Resultados de tests ejecutados |

## Reglas de Actualización

### plan-inicial/
- **NO MODIFICAR NUNCA**. Documentación original del componente.
- Sirve como referencia histórica.

### plan-actual/
- **ACTUALIZAR AQUÍ** cuando se realicen cambios.
- Refleja el estado actual del código y la implementación.
- Los cambios deben documentarse en `Logs/`.

## Próximo Número de Componente

El próximo componente a crear debe usar el número: **11**

## Logs

Los cambios se registran en `Logs/` con formato: `NN-DESCRIPCION_BREVE_AAAA-MM-DD_HH-MM-SS.md`

## Mensajes entre Modelos

Para colaboración entre modelos, usar estructura en `Mensajes entre modelos/` con carpetas por tema.
