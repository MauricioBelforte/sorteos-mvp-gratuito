# 01 - Requerimientos - Optimización de RAM para la Estrategia G en Render free

## Problema

El sorteo de una publicación real de Instagram en producción muere por **OOM del contenedor**:

- Render free tier = **512 MB** de RAM totales para Node + Express + Prisma + Xvfb + Chrome real.
- La Estrategia G (scroll anónimo completo) requiere **Chrome real headful** para que Instagram muestre todos los comentarios (verificado: 2393/2399 con Chrome real vs ~15 con Chromium de Playwright).
- Con Chrome real + scroll infinito de una página pesada, el contenedor supera los 512 MB y Render lo mata a mitad del scraping (`Ran out of memory (used over 512MB)`), cortando el request → el front muestra `Failed to fetch`.

**Estado:** el código actual (orquestador con channel `chrome`, Dockerfile con Xvfb + flags de bajo consumo, heap Node 384 MB) **funciona pero se queda corto de RAM en producción free**. La Estrategia G con Xvfb pagado (plan con más RAM) ya está lista y no se descarta.

## Objetivos

1. **Reducir el consumo de RAM** del scraping de Instagram para que la Estrategia G corra DENTRO de los 512 MB del plan free de Render.
2. **Mantener la captura de comentarios** lo más cercana posible al techo real (target: la mayor cantidad de comentarios que IG exponga), sin pasar a otra red social.
3. **Añadir observabilidad**: Render free no da métricas de RAM; hay que poder medir el consumo desde adentro del contenedor (`/sys/fs/cgroup/memory.current`, RSS de Node) para saber cuánto margen queda y validar cada optimización.
4. **No romper** la versión local (Windows) ni el flujo actual verificado.

## Alcance

- `api/src/collectors/instagram-v2.ts`: flags de lanzamiento del navegador.
- `api/src/collectors/strategies/scroll-anon-completo.ts`: estrategia de scroll (recreación periódica de página, recolección por tandas para liberar DOM).
- `Dockerfile` + CMD (Xvfb a menor resolución; posibles flags en el arranque).
- `api/src/collectors/instagram.ts` (helper `extraerParesDOM`), únicamente si es necesario para liberar memoria del DOM.
- Scripts/wire de diagnóstico local (`prueba-ram` hack) comparados contra producción.
- **No incluye**: cambio de proveedor/hosting (se mantiene Render free), eliminación de la Estrategia G, migración a Apify como fuente primaria (queda como alternativa documentada, no como eje de este módulo).

## Restricciones

- **NO modificar** los flujos estables (AGENTS.md sección 16). La Estrategia G es estable y verfica — los cambios de optimización deben mantener el mismo comportamiento de captura.
- El código **actual funciona** (local y con plan de pago): antes de tocar, respaldar y documentar la versión vigente (ver `02-Analisis.md`).
- La sesión/cookies y el modo manual no cambian.
- Queda documentado en `Logs/` y en `plan-actual/05-Checklist.md`.
- Todo lo que se implemente debe poder **verificarse localmente** antes de desplegarse (prueba de esta nueva versión en local).

## Criterios de Éxito

- `POST /api/sorteos/analizar` contra una publicación real de IG completa el scroll DENTRO de 512 MB y guarda captura real con participantes (>>0).
- La medición de memoria (cgroup) muestra pico < límite, con log visible en Render.
- Sin regresiones del flujo local (sortear con URL manual/real sigue funcionando).