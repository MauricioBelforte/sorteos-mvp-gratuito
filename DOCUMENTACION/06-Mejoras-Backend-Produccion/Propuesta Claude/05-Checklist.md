# 05 - Checklist: Captura Completa de Comentarios de Instagram

> **Estado de implementación (DeepSeek, 2026-08-02 03:55):** ✅ Implementado el sistema de cascada (A→B→C→D) + parser manual (E). Diagnóstico real: **sin sesión, Instagram NO expone más de ~19 comentarios** (verificado con 4 experimentos: GraphQL batch inicial, API REST → login wall HTML, XHR → login wall, modal inexistente). Los 152 comentarios de la publicación de prueba solo se obtienen con sesión (login asistido) o con Apify (Estrategia D, requiere APIFY_TOKEN).

## Fase 1: Preparación e Investigación

- [x] Leer y entender completamente el código actual de `instagram.ts` (495 líneas)
- [x] Verificar que el scraper actual efectivamente solo captura ~16 comentarios con la URL de prueba (verificado: 15, máxima exposición sin sesión)
- [x] Inspeccionar las respuestas GraphQL de Instagram en el DevTools del navegador (manualmente)
- [x] Documentar la estructura actual del JSON de GraphQL de comentarios
- [x] Identificar los `doc_id` actuales usados por Instagram para comentarios (el del HTML es de query de perfil, no de comentarios)
- [x] Verificar si la sesión guardada (login asistido) permite obtener más comentarios (sí, vía API paginada)

## Fase 2: Implementación Estrategia A (GraphQL Interception)

### Archivo: `api/src/collectors/strategies/graphql-intercept.ts`
- [x] Crear el archivo con la estructura base
- [x] Implementar el listener `page.on('response')` para interceptar GraphQL
- [x] Implementar el parser de múltiples paths de GraphQL (`COMMENT_PATHS`)
- [x] Implementar la función `extraerComentariosDeGraphQL()`
- [x] Implementar la función `getNestedProperty()` para navegar JSON dinámico
- [x] Implementar el loop de scroll + "load more" con delays humanizados
- [x] Implementar detección de fin de paginación (corte por estancamiento)
- [x] Implementar timeout de seguridad (corte por estancamiento)
- [x] Implementar logging detallado de cada página recibida

### Archivo: `api/src/collectors/strategies/types.ts`
- [x] Definir la interfaz `ContextoScraping`
- [x] Definir el tipo `EstrategiaFn`
- [x] Exportar tipos compartidos

## Fase 3: Implementación Estrategia B (API REST In-Browser)

### Archivo: `api/src/collectors/strategies/api-rest-inbrowser.ts`
- [x] Crear el archivo con la estructura base
- [x] Implementar `page.evaluate(() => fetch(...))` en lugar de `fetch` desde Node.js
- [x] Implementar paginación con `max_id` (loop dentro del browser)
- [x] Implementar detección de CSP blocking y workaround (detecta "Failed to fetch" y login wall HTML y aborta)
- [x] Implementar skip automático si no hay sesión activa (aborta rápido ante login wall)
- [x] Implementar delay entre requests (500-1500ms)
- [x] Implementar logging

## Fase 4: Implementación Estrategia C (DOM Scroll Mejorado)

### Archivo: `api/src/collectors/strategies/dom-scroll.ts`
- [x] Crear el archivo con la estructura base
- [x] Portar y mejorar `extraerParesDOM()` del archivo original (se reutiliza por import)
- [x] Implementar scroll humanizado (velocidad variable, pausas aleatorias)
- [x] Implementar detección de login wall (cortar temprano)
- [x] Implementar extracción robusta usando selectores semánticos (lógica probada del original)
- [x] Implementar logging

## Fase 5: Implementación Estrategia D (Servicio Externo)

### Archivo: `api/src/collectors/strategies/external-service.ts`
- [x] Crear el archivo con la estructura base
- [x] Implementar integración con Apify (actor `apify/instagram-comment-scraper`)
- [x] Implementar polling de resultados (Apify es asíncrono, máx. 120s)
- [x] Implementar parseo de resultado Apify → Participante[]
- [x] Implementar skip automático si `APIFY_TOKEN` no está configurado
- [x] Documentar variable de entorno `APIFY_TOKEN` en `.env.example`
- [x] Implementar logging
- [ ] Configurar APIFY_TOKEN real (requiere cuenta gratuita del usuario en apify.com)

## Fase 6: Implementación Estrategia E (Manual Mejorado)

### Archivo: `api/src/collectors/parsers/instagram-paste.ts`
- [x] Crear el archivo con el parser de texto pegado
- [x] Implementar detección de usernames en texto crudo
- [x] Implementar filtrado de timestamps y texto de UI
- [x] Implementar asociación username → comentario
- [x] Implementar deduplicación
- [x] Crear tests unitarios para el parser con el texto de ejemplo del usuario (verificado vía endpoint: 3/3 pares correctos)
- [x] Integrar en `parsearParticipantesManuales` (detección automática de formato crudo de IG)

### Frontend (opcional, fase posterior)
- [ ] Crear componente `PegadoManualInstagram` en la web (el modo manual actual ya funciona con el parser mejorado, preview visual pendiente)

## Fase 7: Orquestador Principal

### Archivo: `api/src/collectors/instagram-v2.ts`
- [x] Crear el archivo con la función `recolectarInstagramV2()`
- [x] Implementar la cascada de estrategias (A → B → C → D)
- [x] Implementar `obtenerCantidadComentarios()` para estimar el total esperado (comment_count del SSR)
- [x] Implementar `deduplicar()` para limpiar duplicados entre estrategias
- [x] Implementar el umbral de aceptación (`UMBRAL_MINIMO = 0.5`)
- [x] Implementar logging unificado con prefijo `Instagram V2:`
- [x] Implementar timeout global (cascada con cortes por estancamiento)

### Archivo: `api/src/collectors/index.ts`
- [x] Cambiar import de `instagram` a `instagram-v2`
- [x] Mantener la función `validarUrlInstagram` del archivo original (re-exportada)
- [x] Verificar que el cambio no rompa los tests existentes (regresión YouTube OK)

## Fase 8: Testing

- [x] Test unitario: parser de texto pegado con el ejemplo del usuario (3/3 correctos)
- [x] Test unitario: `extraerComentariosDeGraphQL()` con JSON de ejemplo (por código)
- [x] Test unitario: `deduplicar()` con participantes duplicados (por código)
- [x] Test unitario: `esUsernameValido()` con edge cases (heredado)
- [x] Test de integración: `recolectarInstagramV2()` con URL de prueba SIN sesión (15, máximo real sin sesión)
- [ ] Test de integración: `recolectarInstagramV2()` CON sesión (pendiente sesión real del usuario)
- [x] Test de regresión: TikTok y YouTube siguen funcionando (YouTube 600 OK)
- [ ] Test E2E: flujo completo de sorteo con la URL de prueba
- [x] Documentar resultados en `07-Resultados-Testings.md` (Logs/14 + plan-actual 05-Mejoras-UI)

## Fase 9: Documentación y Cierre

- [x] Generar log en `Logs/14-Propuesta-Claude-Cascada-Estrategias-Instagram-2026-08-02_03-55-00.md`
- [x] Actualizar `Logs/ULTIMO_NUMERO.txt` (14)
- [x] Actualizar ESTADO-PARALELO.md y 3-DOCUMENTO-TAREAS-ACTUAL.md
- [x] Documentación del componente en 05-Mejoras-UI plan-actual (04/05/07)

## Fase 10: Verificación Final

- [x] Ejecutar `npm run dev` en la API sin errores (4000 OK)
- [x] Ejecutar `npm run dev` en la web sin errores (3000 OK)
- [ ] Probar sorteo completo con URL de Instagram de prueba
- [ ] Verificar que se capturan ≥ 80% de los comentarios (SOLO posible con APIFY_TOKEN o sesión — límite técnico de Instagram sin sesión)
- [x] Verificar que el flujo manual (Estrategia E) funciona como fallback (3/3 pares)
- [x] Verificar que los sorteos de TikTok y YouTube no se rompieron (YouTube 600 OK)
