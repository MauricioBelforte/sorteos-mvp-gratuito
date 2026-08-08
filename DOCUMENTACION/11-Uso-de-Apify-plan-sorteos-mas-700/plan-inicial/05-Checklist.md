# 05-Checklist — Módulo 11: Uso de Apify para sorteos de +700 comentarios

**Autor:** DeepSeek (opencode)  
**Fecha:** 2026-08-08  
**Versión:** 1.0  
**Estado:** Plan Inicial

---

## Tareas Completadas

- [x] Análisis de costos reales de Apify (5 USD/mes free; 0.75/1000; no acumulable)
- [x] Definición de la estrategia por franjas (≤300 anónimo, 300-750 sesión, 750+ Apify)
- [x] Decisión de umbral (750, con margen sobre el techo de 600-700 probado)
- [x] Documentar la promesa de negocio "hasta 1000 gratis" y cómo se cumple
- [x] Roadmap de negocio por fases: Fase 1 SEO → Fase 2 cupones IG → Fase 3 monetización
- [x] Revisar el código actual (external-service.ts, cuota.ts, instagram-v2.ts)

## Tareas Pendientes

### Implementación (bloqueada hasta validar el actor con sesión)
- [ ] Activar APIFY_TOKEN en Render y validar el actor de Apify CON sesión para 750-1000
- [ ] Subir `maxComments` del actor (hoy 200) sin que degrade (pendiente de pruebas)
- [ ] Bajar `APIFY_CUOTA_MENSUAL` de 45 → 5 en el código
- [ ] Agregar umbral configurable `APIFY_UMBRAL_CANTIDAD` (default 750) en el selector de estrategia
- [ ] Priorizar Apify cuando `cantidadEsperada > umbral`, con fallback a sesión/anónimo
- [ ] Probar que un sorteo ≤750 NUNCA invoca Apify

### Testings (ver 06-Plan-Testings)
- [ ] Test del actor Apify con post de ~900 comentarios
- [ ] Test del flujo de cuota agotada (bloqueo + Pase Rápido)
- [ ] Test de fallback cuando Apify falla
- [ ] Test de costos reales por sorteo (medir en el dashboard de Apify)

### Frontend / negocio
- [ ] Mensaje de cuota agotada claro en el front (ya existe estado CuotaAgotadaError)
- [ ] (Fase 2) Sistema de cupones promocionales para sorteo de 1000 (vía IG)
- [ ] (Fase 2) Landing para canje de cupón (a definir cuando se lance)

## Estado

**En fase de planificación/validación.** No se implementó código aún.