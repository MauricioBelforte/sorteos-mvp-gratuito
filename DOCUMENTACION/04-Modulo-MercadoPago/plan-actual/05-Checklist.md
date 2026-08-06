# Checklist - Módulo Mercado Pago

## Tareas Completadas

### Configuración Inicial
- [x] Configurar package.json
- [x] Configurar tsconfig.json
- [x] Configurar estructura de carpetas
- [x] Instalar dependencias (mercadopago SDK)

### Tipos
- [x] Definir PaymentConfig
- [x] Definir PaymentRequest
- [x] Definir PaymentResponse
- [x] Definir WebhookNotification
- [x] Definir PaymentStatus
- [x] Definir UsagePaymentConfig

### Cliente API
- [x] Implementar MercadoPagoClient class
- [x] Implementar constructor con config
- [x] Implementar createPreference()
- [x] Implementar getPayment()
- [x] Corregir error de TypeScript en error handling

### Funciones de Pago
- [x] Implementar createUsagePayment()
- [x] Implementar createPayment()
- [x] Implementar verifyWebhookSignature()
- [x] Implementar lógica de pago por uso

### Exportador
- [x] Implementar index.ts
- [x] Exportar MercadoPagoClient
- [x] Exportar funciones de pago
- [x] Exportar tipos
- [x] Crear README.md

### Compilación
- [x] Compilar módulo sin errores
- [x] Generar archivos .d.ts
- [x] Verificar dist/ folder
- [x] Corregir errores de TypeScript (DOM, Node types)

### Integración en MVP
- [x] Instalar módulo en backend del MVP
- [x] Crear rutas de pagos (/checkout, /webhook)
- [x] Configurar variables de entorno
- [x] Integrar en api/src/index.ts

### Pase Rápido con MercadoPago (04/08, Log 24)
- [x] Restaurar `shared-modules/mercadopago` en el repo (estaba sola como junction rota)
- [x] Corregir dependencia de `api/package.json`: `file:../../shared-modules/...` → `file:../shared-modules/...`
- [x] Exportar e implementar `createPayment` en el módulo compartido (+ reintento de build dist)
- [x] Modelo Prisma `PagoPase` + migración `20260803150000_pago_pase` aplicada
- [x] `api/src/lib/pases.ts` (crearPase, guardarPreferenciaMp, aprobarPase, rechazarPase, estadoPase, validarPase, consumirPase, PaseInvalidoError)
- [x] Rutas `api/src/routes/pagos.ts`: POST /pase, GET /pase/:id, POST /webhook, POST /verificar
- [x] `paseId` + validación en `preview.ts` y `sorteos-service.ts` (402 `pase_invalido`, consumo al crear sorteo)
- [x] Frontend: `crearPasePago`/`estadoPase`/`verificarPago`; wizard con redirect a checkout y restore post-pago; página de retorno `/pago`
- [x] Typecheck api y web OK
- [x] E2E offline: pase aprobado → sorteo creado → pase consumido; reuso → 402
- [x] **Fixes de integración MP (05/08, Log 36)**: URL base SIEMPRE `https://api.mercadopago.com` (el host `/sandbox` no existe; el sandbox se identifica por el token TEST-); `notification_url` ahora usa `MERCADO_PAGO_NOTIFICATION_URL` o `API_BASE_URL/api/pagos/webhook` (antes apuntaba a una ruta no montada); `verifyWebhookSignature` corregida al formato real de MP (manifest `id:...;request-id:...;ts:...;` con HMAC-SHA256 + timingSafeEqual); webhook valida la firma si hay secret (401 si inválida); `pase = pase` eliminado. Tests: `pagos.spec.ts` 5/5 (firma válida/alterada/sin request-id/uppercase/header malformado)
- [ ] Prueba en sandbox de Mercado Pago (E2E del checkout real) — **bloqueado: `MERCADO_PAGO_ACCESS_TOKEN` en `.env` es placeholder inválido (401/403); pegar un token TEST- real de developers.mercadopago.com**

## Tareas Pendientes

### Testing
- [x] Crear plan de testings
- [x] Ejecutar tests unitarios
- [x] Ejecutar tests de integración
- [x] Unit tests de firma de webhooks (05/08, Log 36): 5/5 en `pagos.spec.ts`
- [ ] Test en sandbox de Mercado Pago (bloqueado por token placeholder)
- [ ] Test webhooks reales
- [x] Documentar resultados de tests (E2E offline en Log 24)

### Documentación
- [ ] Completar README.md con ejemplos
- [ ] Documentar uso en diferentes frameworks
- [ ] Documentar configuración de webhooks
- [ ] Documentar sandbox vs producción

## Estado General
**Completado:** 85%  
**Pendiente:** 15%  
**Bloqueadores:** Ninguno
