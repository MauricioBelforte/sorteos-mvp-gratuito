# Reglas Globales para la IA (Plantilla Genérica)

## 1. Idioma
- Todas las comunicaciones deben realizarse **estrictamente en español**.

## 2. Verificación inicial en proyectos
Antes de ejecutar cualquier tarea en un repositorio o proyecto:
1. Verificar siempre si existe un archivo `AGENTS.md` en la **raíz del proyecto**.
2. Si existe, leerlo completo y **priorizar sus instrucciones** sobre cualquier regla global.

## 3. Estructura de Documentación del Proyecto

La documentación vive dentro de `DOCUMENTACION/`. La raíz del proyecto solo contiene `AGENTS.md`, `README.md`, y configuraciones generales.

### DOCUMENTACION/ — Raíz de la carpeta (documentación general vigente)

En la raíz de `DOCUMENTACION/` están los 4 documentos generales que reflejan el estado actual del sistema y deben ser consultados/modificados durante el desarrollo:

| Archivo | Contenido |
|---------|-----------|
| `1-DOCUMENTO-DE-ESPECIFICACIONES-ACTUAL.md` | Especificaciones técnicas vigentes |
| `2-DOCUMENTO-DISENO-ACTUAL.md` | Diseño detallado vigente |
| `3-DOCUMENTO-TAREAS-ACTUAL.md` | Checklist de tareas con estado actual |
| `4-DOCUMENTO-EJECUCION-ACTUAL.md` | Código de ejecución vigente |

### DOCUMENTACION/Plan Inicial/ — Solo el origen del proyecto

Esta carpeta contiene la documentación original del proyecto. **No refleja el estado actual del código.** Solo debe consultarse como referencia histórica. ⚠️ No debe modificarse.

### DOCUMENTACION/ — Documentación por Componentes

Cada componente agregado al sistema se documenta en una subcarpeta numerada cronológicamente. **Cada componente tiene DOS carpetas obligatorias:**

```
DOCUMENTACION/
├── README.md                          ← Explicación del sistema de carpetas
├── 1-DOCUMENTO-DE-ESPECIFICACIONES-ACTUAL.md
├── 2-DOCUMENTO-DISENO-ACTUAL.md
├── 3-DOCUMENTO-TAREAS-ACTUAL.md
├── 4-DOCUMENTO-EJECUCION-ACTUAL.md
├── Plan Inicial/                      ← Solo origen del proyecto (no modificar)
├── 01-Nombre-Componente/
│   ├── plan-inicial/                  ← Documentación original del componente (NO MODIFICAR)
│   │   ├── 01-Requerimientos.md
│   │   ├── 02-Analisis.md
│   │   ├── 03-Diseno.md
│   │   ├── 04-Codigo.md
│   │   └── 05-Checklist.md
│   └── plan-actual/                   ← Documentación vigente del componente (ACTUALIZAR AQUÍ)
│       ├── 01-Requerimientos.md
│       ├── 02-Analisis.md
│       ├── 03-Diseno.md
│       ├── 04-Codigo.md
│       └── 05-Checklist.md
├── 02-Nombre-Componente/
│   ├── plan-inicial/
│   └── plan-actual/
└── 03-Nombre-Componente/
    ├── plan-inicial/
    └── plan-actual/
```

### Archivos Obligatorios por Carpeta (plan-inicial y plan-actual)

Cada carpeta (`plan-inicial/` y `plan-actual/`) debe contener exactamente estos 5 archivos:

| Archivo | Contenido |
|---------|-----------|
| `01-Requerimientos.md` | Problema, objetivos, alcance, restricciones |
| `02-Analisis.md` | Análisis del dominio, alternativas, decisiones |
| `03-Diseno.md` | Arquitectura, diagramas, flujos |
| `04-Codigo.md` | Archivos involucrados, funciones clave, logs relacionados |
| `05-Checklist.md` | Checklist de tareas completadas y pendientes del componente |
| `06-Plan-Testings.md` | Plan de testings profesional para identificar bugs y fallos antes de la primera prueba manual |
| `07-Resultados-Testings.md` | Resultados detallados de la ejecución de tests con referencias al código y soluciones propuestas |


### Reglas de Actualización por Componente

**plan-inicial/**:
- **NO MODIFICAR NUNCA**. Contiene la documentación original del componente tal como fue concebido inicialmente.
- Sirve como referencia histórica para entender el diseño original y compararlo con el estado actual.

**plan-actual/**:
- **ACTUALIZAR AQUÍ** cuando se realicen cambios en el componente.
- Refleja el estado actual del código y la implementación.
- Si se modifica un componente existente, actualizar los archivos en `plan-actual/`.
- Los cambios deben documentarse en `Logs/` con el formato estándar.

### Reglas de Actualización General
- Al realizar cambios significativos en el código, actualizar los 4 archivos `*-ACTUAL.md` en la raíz de `DOCUMENTACION/`.
- No modificar los archivos dentro de `DOCUMENTACION/Plan Inicial/` (raíz).
- Si se requiere crear una nueva funcionalidad, agregarla al `3-DOCUMENTO-TAREAS-ACTUAL.md`.
- **Cuando se agregue un componente nuevo**, ver la sección 11.

## 4. Estándar de Commits y Protocolo de Push (Git)

### 4.1 Estilo de Commits
- **Idioma:** Español.
- **Tiempo verbal:** Pasado descriptivo (pasivo o impersonal). Ejemplo: "Se agregó el módulo de autenticación".

### 4.2 Protocolo de Push (Commits Completos y Detallados)

Cuando el usuario solicite explícitamente *"hace un push o subilo a github o similar"*, el Agente debe seguir el siguiente flujo de trabajo obligatorio:

1. **Verificar el último commit en el remoto:** Revisar el último commit subido (por ejemplo, mediante `git log origin/main -1` o la rama correspondiente).
2. **Revisar el historial de cambios locales, los logs:** Comparar el estado actual del repositorio local contra la última versión subida (por ejemplo, mediante `git diff --stat origin/main`).
3. **Analizar los cambios en detalle:** Examinar archivo por archivo los cambios realizados (por ejemplo, mediante `git diff origin/main`) para comprender el alcance completo de las modificaciones.
4. **Redactar un commit completo y estructurado:**
   - **Idioma:** Español, con tiempo verbal en pasado descriptivo (pasivo o impersonal).
   - **Título:** Un título descriptivo que resuma el cambio principal.
   - **Cuerpo (opcional):** Si hay múltiples cambios, incluir una lista con viñetas detallando cada modificación encontrada.
5. **Ejecutar el commit y push:** Una vez redactado el mensaje, agregar los archivos, realizar el commit y ejecutar el push, informando al usuario del resultado.

**Ejemplos de formato de commit:**
  ```
  Se actualizó la documentación de la Práctica 4

  - Se agregó la guía de estudio teórica de UART
  - Se corrigió el diagrama temporal del Ejercicio 1
  - Se eliminaron archivos binarios obsoletos del directorio
  ```

**Nota:** Durante el push, es posible que se muestren advertencias sobre la conversión de saltos de línea (LF a CRLF). Esto es normal en entornos Windows y no afecta la integridad de los archivos.

## 5. Respaldos ante Cambios Grandes
Antes de realizar modificaciones grandes (como refactorizar el proceso principal):
1. **Creación de Carpeta:** Verificar la existencia de `Obsoletos/` en la ubicación del archivo.
2. **Respaldo:** Guardar una copia con nomenclatura: `AAAA-MM-DD_HH-MM-SS_nombre_archivo.extension`.

## 6. Registro de Cambios (Logs)
Cada vez que finalices una tarea, genera un informe de cambios:
1. **Carpeta de Logs:** En la carpeta `Logs/` en la raíz.
2. **Numeración Secuencial:** Leer `Logs/ULTIMO_NUMERO.txt` para el próximo número, y actualizarlo.
   - Formato: `NN-DESCRIPCION_BREVE_AAAA-MM-DD_HH-MM-SS.md`.
3. **Contenido Obligatorio:** Detallar código original, nuevo código, y descripción breve de la modificación.

## 7. Seguimiento de Progreso (Checklist)
Cada vez que completes una tarea:
1. Leer `DOCUMENTACION/3-DOCUMENTO-TAREAS-ACTUAL.md` (o el equivalente local).
2. Marcar como completado cambiando `[ ]` por `[x]`.

## 8. Progreso Visual Detallado (UX Obligatorio)
Toda tarea de larga duración (conexiones externas, procesos pesados, operaciones asíncronas) **DEBE** mostrar progreso visual al usuario en la interfaz.
- **Spinners y Loaders:** Por ejemplo, mientras se realizan operaciones de red o procesamiento.
- **Mensajes de estado:** Textos descriptivos ("Iniciando servidor...", "Procesando datos...", "Sincronizando...").
- **Prevención de clicks rápidos:** Deshabilitar botones de acción hasta que el servicio subyacente esté 100% operativo.

## 9. Modularidad y Desacoplamiento
- **Separación de Responsabilidades:** La lógica pesada de sistema (procesos, conexiones, operaciones de I/O) debe estar separada de la interfaz de usuario.
- **Frontend/UI:** La capa de presentación solo debe llamar a funciones expuestas por la capa de lógica/servicios.
- **No acoplar** lógica de sistema operativo o infraestructura directamente en los componentes de la interfaz.

## 10. Protocolo de Comunicación entre Modelos de Lenguaje (Chat por Temas)

Cuando una tarea se bloquee o requiera colaboración entre modelos, usar estructura tipo chat con carpetas por tema.

### Estructura
```
Mensajes entre modelos/
├── ESTADO-PARALELO.md                     ← Coordinación (quién trabaja en qué)
├── tema-problema/                         ← Carpeta por TEMA a resolver
│   ├── 2026-07-04_05-59-00_1-DEEPSEEK-planteo.md
│   ├── 2026-07-04_18-00-00_2-GEMINI-analisis.md
│   ├── 2026-07-04_20-30-00_3-DEEPSEEK-prueba-solucion.md
│   └── documentacion-solucion/           ← Docs adicionales si la solución es extensa
│       └── diagrama-propuesta.md
```

### Reglas
1. **Carpeta por tema:** Cada problema/feature tiene su propia carpeta dentro de `Mensajes entre modelos/`.
2. **Mensajes tipo chat:** Archivos con formato:
   - `YYYY-MM-DD_HH-MM-SS_N-MODELO-descripcion-breve.md`
   - `N` = número secuencial del mensaje en ese hilo
   - `MODELO` = quien escribe (DeepSeek, Gemini, Claude, etc.)
3. **Fecha y hora:** Usar timestamp real en el nombre del archivo.
4. **Firma en el contenido:** Incluir al inicio del archivo:
   ```markdown
   **Modelo:** DeepSeek
   **Fecha:** 2026-07-04 18:00:00
   **Responde a:** `2026-07-04_05-59-00_1-DEEPSEEK-planteo.md`
   ```
5. **Documentación adjunta:** Si una solución requiere documentos extensos, crear una subcarpeta dentro del tema (ej: `documentacion-solucion/`).
6. **No eliminar mensajes anteriores:** El hilo completo debe conservarse para trazabilidad.
7. **ESTADO-PARALELO.md:** Mantener actualizado para saber qué modelo trabaja en cada tema.
8. **Carpetas enumeradas:** Las carpetas dentro de `Mensajes entre modelos/` usan prefijo numérico (`NN-`) para orden cronológico. Ejemplo: `01-Investigacion-FBNeo-GGPO/`, `02-Diseno-Arquitectura/`.
9. **Subcarpetas por agente (opcional):** Si múltiples agentes trabajan dentro del mismo tema, cada uno crea su propia subcarpeta dentro del tema para no pisar archivos. Ejemplo: `01-Investigacion-FBNeo-GGPO/1-DEEPSEEK-planteo/`, `01-Investigacion-FBNeo-GGPO/2-CLAUDE-respuesta/`. Si no hay riesgo de colisión (un solo archivo por agente), se puede prescindir de subcarpetas y usar el formato estándar de mensajes.


## 11. Documentación de Nuevos Componentes (DOCUMENTACION)
Al crear un nuevo componente o pipeline (ej: nueva integración con un servicio):
1. Verificar el próximo número en `DOCUMENTACION/README.md`.
2. Crear carpeta `DOCUMENTACION/{NN}-Nombre/`.
3. Crear la carpeta `plan-inicial/` dentro del componente.
4. Crear los 5 archivos obligatorios en `plan-inicial/` (`01-Requerimientos.md`, `02-Analisis.md`, `03-Diseno.md`, `04-Codigo.md`, `05-Checklist.md`).
5. Crear la carpeta `plan-actual/` dentro del componente (vacía inicialmente).
6. Crear los 5 archivos obligatorios en `plan-actual/` (pueden ser copia de plan-inicial al inicio).
7. Actualizar `DOCUMENTACION/README.md`.

## 12. Verificación y Diagnóstico Post-Tarea
Antes de dar una tarea por terminada:
1. **Verificar el inicio:** Ejecutar el comando de desarrollo correspondiente al proyecto (ej: `npm run dev`, `python manage.py runserver`, `cargo run`, etc.).
2. **Sin Errores en Consola:** Asegurarse de que no haya errores de compilación/linting y que la aplicación levante exitosamente.
3. **Flujo Completo:** Si modificaste procesos críticos, verificar localmente que funcionen correctamente antes de decir que la tarea está finalizada.

## 13. Flujo de Trabajo: Documentación Primero (Documentation-First)

Este es el **flujo de trabajo obligatorio**:

### Para tareas NUEVAS (nuevo componente):
1. **Antes de escribir código:** Crear la carpeta del componente en `DOCUMENTACION/` y sus 5 archivos.
2. Implementar la funcionalidad.
3. Verificar que todo funcione (ejecutar el proyecto).
4. Revisar los 5 archivos iniciales contra el código real y actualizar si hay diferencias.
5. Generar log en `Logs/`.

### Para tareas sobre MÓDULOS EXISTENTES (mejoras, bugfixes):
1. **Antes de escribir código:** Leer los archivos del componente en `DOCUMENTACION/` (o si no existe, usar el plan general).
2. Implementar la modificación.
3. Verificar que funcione.
4. Actualizar los archivos del módulo/documentación para reflejar el cambio.
5. Actualizar los `*-ACTUAL.md` de la raíz si el cambio es significativo (arquitectura, flujos principales).
6. Generar log en `Logs/`.

## 14. Plan de Testings Profesional para Nuevos Módulos

Antes de integrar un nuevo módulo al proyecto y realizar la primera prueba manual del usuario, se debe crear y ejecutar un plan de testings profesional para identificar bugs y fallos.

### Requisitos del Plan de Testings

1. **Tipos de pruebas a incluir:**
   - Pruebas unitarias de cada función/componente
   - Pruebas de integración entre módulos
   - Pruebas de casos límite (edge cases)
   - Pruebas de manejo de errores
   - Pruebas de rendimiento si aplica

2. **Documentación del plan:**
   - Crear archivo `06-Plan-Testings.md` en la carpeta `plan-actual/` del componente
   - Listar todos los escenarios a probar
   - Definir criterios de éxito para cada prueba

3. **Ejecución obligatoria:**
   - Ejecutar todas las pruebas antes de notificar al usuario
   - Documentar resultados (pasaron/fallaron)
   - Corregir fallos encontrados antes de la primera prueba manual

4. **Actualización de checklist:**
   - Agregar items de testing en `05-Checklist.md`
   - Marcar como completado solo cuando todas las pruebas pasen

### Flujo de Testings

1. **Diseñar el plan:** Antes de implementar, definir qué se va a probar
2. **Implementar pruebas:** Crear tests automatizados cuando sea posible
3. **Ejecutar pruebas:** Correr el suite de tests completo
4. **Corregir fallos:** Solucionar bugs encontrados antes de la entrega
5. **Documentar resultados:** Registrar en `06-Plan-Testings.md` qué pruebas pasaron
6. **Notificar al usuario:** Solo cuando el plan de testings esté completado exitosamente

## 15. Modularización de Flujos Complejos

Cuando se desarrolle una funcionalidad nueva que comparta lógica con flujos existentes que ya funcionan:

1. **Identificar el flujo nuevo vs existente:** Si el nuevo flujo tiene requisitos diferentes o puede necesitar cambios que afecten a flujos que ya funcionan, se debe crear un módulo/handler/componente separado.
2. **No tocar lo que funciona:** Si un handler ya funciona correctamente para los modos existentes, no modificarlo para el nuevo flujo. En su lugar:
   - Agregar **nuevos handlers** para el nuevo flujo.
   - El nuevo handler puede REUTILIZAR funciones auxiliares compartidas pero debe tener su propia lógica de orquestación.
   - Esto permite que el nuevo flujo pueda hacer cambios agresivos sin riesgo de romper los flujos existentes.
3. **Documentar la decisión:** En los archivos del componente (`03-Diseno.md` o `04-Codigo.md`), explicar por qué se optó por un flujo separado y qué comparte con los flujos existentes.

## 16. Flujos Bloqueados (Estables) — NO MODIFICAR

Estos flujos han sido verificados y no deben modificarse. Cualquier cambio debe hacerse en un flujo paralelo nuevo.

> **Nota:** Esta sección debe personalizarse por proyecto. Listar aquí los flujos/características que han sido verificados y deben permanecer estables.

| Flujo | Descripción | Componente | Arquitectura |
|-------|-------------|------------|-------------|
| [ ] | | | |

## 17. Trabajo en Paralelo entre Agentes

Cuando múltiples agentes trabajen simultáneamente, usar el sistema de chat por temas definido en la sección 10:

1. **Archivo de coordinación obligatorio**: `Mensajes entre modelos/ESTADO-PARALELO.md`.
2. **Leerlo siempre** antes de empezar cualquier tarea (antes de tocar código o archivos).
3. **Actualizarlo** al reclamar, iniciar, bloquear o completar una tarea.
4. **No modificar archivos** que otro agente tenga `reclamado` o `en progreso`.
5. Cada entrada debe incluir: nombre de tarea, agente, archivos involucrados, estado, timestamp.
6. Los agentes se identifican con su nombre/modelo (ej: `Claude`, `GPT-4`, `Gemini`, `DeepSeek`).
7. **Usar carpetas por tema** para cada problema/feature (sección 10.1). Si dos agentes ocupan temas distintos → pueden trabajar en paralelo sin issues.

## 18. Sistema de Rotación de Logs

El proyecto implementa un sistema automático de rotación de logs para evitar que los archivos crezcan indefinidamente.

### Estructura de Logs

```
Logs/
├── rotated/                          ← Logs rotados (históricos)
│   ├── 01-componente-2026-06-30.log
│   ├── 02-servicio-2026-10-03.log
│   └── 03-aplicacion-2026-10-03.log
├── aplicacion.log                    ← Log actual (siempre < tamaño máximo)
├── output.txt
└── ULTIMO_NUMERO.txt
```

### Implementación en Código

> **Nota:** Adaptar según el lenguaje/framework del proyecto.

**Configuración:**
- `MAX_LOG_SIZE` - Umbral de rotación (ej: 500KB)
- `LOG_DIR` - Directorio de logs
- `LOG_ROTATED_DIR` - Directorio de logs rotados

**Función de rotación:**
- Verificar el tamaño del log actual después de cada write
- Si el tamaño >= umbral, renombrar el archivo a `logs/rotated/nombre-YYYY-MM-DD.log`
- Crear automáticamente un nuevo log vacío
- Registrar la rotación con mensaje `[LOG ROTATION]`

**Comportamiento:**
- Las carpetas de logs se crean automáticamente si no existen
- La rotación es transparente para el usuario
- Los logs rotados conservan la fecha en el nombre para trazabilidad

### Reglas para Nuevos Logs

Si necesitas agregar logging en el código:
1. **Usar el sistema de logging del lenguaje** (ej: `console.log`, `logging`, `log4j`, etc.)
2. **No crear archivos de log adicionales** - Usa el sistema existente
3. **Si necesitas un log separado** (ej: para un componente específico):
   - Implementar rotación similar en el código del componente
   - Usar el mismo formato de nomenclatura: `NN-nombre-YYYY-MM-DD.log`
   - Guardar en `logs/rotated/` cuando se rote

### Formato de Nomenclatura para Logs Rotados

**Formato:** `NN-nombre_log-YYYY-MM-DD.log`

**Ejemplos:**
- `01-componente-2026-06-30.log`
- `02-servicio-2026-10-03.log`
- `03-aplicacion-2026-10-03.log`

**NN** = Número secuencial (se incrementa automáticamente al mover logs existentes)

## 19. Archivo de Hilos de Chat Resueltos (RESUELTOS)

Cuando un problema analizado en `Mensajes entre modelos/` se considere **sustancialmente resuelto** (aunque pueda tener retoques pendientes):

1. **Crear carpeta `Mensajes entre modelos/RESUELTOS/`** si no existe.
2. **Mover la carpeta del tema** de `Mensajes entre modelos/` a `Mensajes entre modelos/RESUELTOS/`.
3. **Agregar prefijo numérico** al nombre de la carpeta para orden cronológico:
   ```
   Mensajes entre modelos/tema-problema/
   → Mensajes entre modelos/RESUELTOS/1-tema-problema/
   ```
4. **Mantener el historial intacto:** No se eliminan ni modifican los archivos del hilo.
5. **Se puede retomar después:** Si en el futuro se quiere mejorar o ajustar algo, se puede:
   - Volver a mover la carpeta de `RESUELTOS/` a `Mensajes entre modelos/`
   - Agregar nuevos archivos al hilo existente
   - O crear un hilo nuevo referenciando al anterior
6. **Actualizar `ESTADO-PARALELO.md`:** La tarea se mueve al historial de completadas con la fecha de archivo.

## 20. Empaquetado y Distribución

> **Nota:** Esta sección debe personalizarse según el tipo de proyecto (web, desktop, móvil, librería, etc.).

Para generar el artefacto distribuible del proyecto:

```bash
# Comando(s) de build/package según el proyecto
```

**Qué hace:**
1. Compilación del código
2. Empaquetado de dependencias
3. Generación del artefacto final

**Output:** [Describir el output esperado y su ubicación]

**Notas:**
- [Notas específicas del proceso de build/package]
- [Consideraciones de distribución]
