# Resultados de Testings - Módulo Mercado Pago

## Estado de Ejecución
**Fecha:** Pendiente  
**Ejecutado por:** Pendiente  
**Resultado General:** Pendiente

## Resultados por Categoría

### 0. Resultados del Pase Rápido — E2E offline (04/08, Log 24, servidores en localhost)
> El E2E del checkout real de MercadoPago requiere un token TEST-/APP_USR- **válido**; el del `.env` es placeholder (MP responde 401/403). Se probó offline todo el flujo de backend con un pase aprobado simulado en DB:

| # | Prueba | Resultado |
|---|--------|-----------|
| 1 | `POST /api/pagos/pase` sin token válido → 500 con mensaje claro | ✅ (error controlado, el pase queda `pendiente` en DB) |
| 2 | `GET /api/pagos/pase/:id` → `{ estado: 'aprobado', moneda: 'ARS', usadoEnSorteoId: null }` | ✅ |
| 3 | `POST /api/sorteos` con `paseId + paseAprobado: true` (participantes manuales) → sorteo creado (ganadores + hash) | ✅ |
| 4 | `GET /api/pagos/pase/:id` post-sorteo → `usadoEnSorteoId` seteado (pase consumido, 1 pase = 1 sorteo) | ✅ |
| 5 | Reintento del sorteo con el mismo pase → **HTTP 402** `{ requierePago: true, motivo: 'pase_invalido', mensaje: 'Este Pase Rápido ya fue utilizado en otro sorteo' }` | ✅ |
| 6 | `POST /api/sorteos/analizar` con pase consumido → 402 `'ya fue utilizado'` | ✅ |
| 7 | `POST /api/sorteos/analizar` con pase inexistente → 402 `'Pase Rápido no encontrado'` | ✅ |
| 8 | Frontend: home y `/pago?estado=success&paseId=...` responden HTTP 200 | ✅ |
| 9 | Typecheck de api y web | ✅ |

### 1. Pruebas Unitarias
- **MercadoPagoClient constructor con config válida:** Pendiente
- **createPreference() con request válido:** Pendiente
- **createPreference() con request mínimo:** Pendiente
- **getPayment() con ID válido:** Pendiente
- **createUsagePayment() con config válida:** Pendiente
- **createPayment() con request personalizado:** Pendiente
- **verifyWebhookSignature() con firma válida:** Pendiente
- **verifyWebhookSignature() con firma inválida:** Pendiente
- **verifyWebhookSignature() con secret incorrecto:** Pendiente

### 2. Pruebas de Integración
- **Crear preferencia en sandbox:** Pendiente
- **Obtener pago de sandbox:** Pendiente
- **Ruta /checkout en Express:** Pendiente
- **Ruta /webhook en Express:** Pendiente

### 3. Pruebas de Edge Cases
- **MercadoPagoClient sin accessToken:** Pendiente
- **createUsagePayment() con referenceId vacío:** Pendiente
- **Mercado Pago API retorna error:** Pendiente
- **Mercado Pago API no responde:** Pendiente
- **Webhook sin firma:** Pendiente
- **Webhook con payload vacío:** Pendiente

### 4. Pruebas de Seguridad
- **Firma manipulada:** Pendiente
- **Payload manipulado:** Pendiente
- **Access token expirado:** Pendiente
- **Access token inválido:** Pendiente

### 5. Pruebas de Sandbox vs Producción
- **Crear pago en sandbox:** Pendiente
- **Crear pago en producción:** Pendiente

## Bugs Encontrados
Ninguno todavía

## Soluciones Aplicadas
Ninguna todavía

## Recomendaciones
- Ejecutar plan de testings antes de primera prueba manual
- Test en sandbox de Mercado Pago
- Configurar ngrok para webhooks locales
- Documentar resultados de tests
