# Plan de Testings - Módulo Mercado Pago

## Objetivo
Identificar bugs y fallos antes de la primera prueba manual del usuario.

## Tipos de Pruebas

### 1. Pruebas Unitarias

#### 1.1 Cliente API
- **Test:** MercadoPagoClient constructor con config válida
  - Input: PaymentConfig con accessToken válido
  - Expected: Cliente inicializado correctamente
  - Status: Pendiente

- **Test:** createPreference() con request válido
  - Input: PaymentRequest con todos los campos
  - Expected: PaymentResponse con init_point
  - Status: Pendiente

- **Test:** createPreference() con request mínimo
  - Input: PaymentRequest solo con campos requeridos
  - Expected: PaymentResponse válido
  - Status: Pendiente

- **Test:** getPayment() con ID válido
  - Input: Payment ID válido
  - Expected: Detalles del pago
  - Status: Pendiente

#### 1.2 Funciones de Pago
- **Test:** createUsagePayment() con config válida
  - Input: PaymentConfig, UsagePaymentConfig, referenceId
  - Expected: PaymentResponse con URLs de checkout
  - Status: Pendiente

- **Test:** createPayment() con request personalizado
  - Input: PaymentConfig, PaymentRequest personalizado
  - Expected: PaymentResponse válido
  - Status: Pendiente

#### 1.3 Verificación de Webhooks
- **Test:** verifyWebhookSignature() con firma válida
  - Input: Firma válida, payload, secret correcto
  - Expected: true
  - Status: Pendiente

- **Test:** verifyWebhookSignature() con firma inválida
  - Input: Firma inválida, payload, secret correcto
  - Expected: false
  - Status: Pendiente

- **Test:** verifyWebhookSignature() con secret incorrecto
  - Input: Firma válida, payload, secret incorrecto
  - Expected: false
  - Status: Pendiente

### 2. Pruebas de Integración

#### 2.1 Integración con Mercado Pago Sandbox
- **Test:** Crear preferencia en sandbox
  - Input: Config sandbox, request válido
  - Expected: Preferencia creada en sandbox
  - Status: Pendiente

- **Test:** Obtener pago de sandbox
  - Input: Payment ID de sandbox
  - Expected: Detalles del pago
  - Status: Pendiente

#### 2.2 Integración con Express
- **Test:** Ruta /checkout en Express
  - Input: POST a /api/pagos/checkout
  - Expected: Response con checkoutUrl
  - Status: Pendiente

- **Test:** Ruta /webhook en Express
  - Input: POST a /api/pagos/webhook con webhook válido
  - Expected: Webhook procesado correctamente
  - Status: Pendiente

### 3. Pruebas de Edge Cases

#### 3.1 Configuración Inválida
- **Test:** MercadoPagoClient sin accessToken
  - Input: PaymentConfig sin accessToken
  - Expected: Error o manejo graceful
  - Status: Pendiente

- **Test:** createUsagePayment() con referenceId vacío
  - Input: referenceId vacío
  - Expected: Error o manejo graceful
  - Status: Pendiente

#### 3.2 Errores de API
- **Test:** Mercado Pago API retorna error
  - Input: Request inválido a API
  - Expected: Error manejado correctamente
  - Status: Pendiente

- **Test:** Mercado Pago API no responde
  - Input: Timeout de API
  - Expected: Error manejado correctamente
  - Status: Pendiente

#### 3.3 Webhooks
- **Test:** Webhook sin firma
  - Input: Webhook sin header x-signature
  - Expected: Error o rechazo
  - Status: Pendiente

- **Test:** Webhook con payload vacío
  - Input: Webhook con body vacío
  - Expected: Error o rechazo
  - Status: Pendiente

### 4. Pruebas de Seguridad

#### 4.1 Verificación de Firmas
- **Test:** Firma manipulada
  - Input: Firma alterada
  - Expected: false (rechazada)
  - Status: Pendiente

- **Test:** Payload manipulado
  - Input: Payload alterado con firma original
  - Expected: false (rechazada)
  - Status: Pendiente

#### 4.2 Manejo de Tokens
- **Test:** Access token expirado
  - Input: Access token expirado
  - Expected: Error de autenticación
  - Status: Pendiente

- **Test:** Access token inválido
  - Input: Access token inválido
  - Expected: Error de autenticación
  - Status: Pendiente

### 5. Pruebas de Sandbox vs Producción

#### 5.1 Sandbox
- **Test:** Crear pago en sandbox
  - Input: Config sandbox: true
  - Expected: Pago creado en sandbox
  - Status: Pendiente

#### 5.2 Producción
- **Test:** Crear pago en producción
  - Input: Config sandbox: false (con token prod)
  - Expected: Pago creado en producción
  - Status: Pendiente (requiere token prod real)

## Criterios de Éxito

- Todas las pruebas unitarias pasan
- Todas las pruebas de integración pasan
- Todas las pruebas de edge cases pasan
- Todas las pruebas de seguridad pasan
- Pruebas de sandbox pasan
- Webhooks se verifican correctamente
- Pagos se crean correctamente
- Errores se manejan correctamente

## Herramientas de Testing

- **Unit Testing:** Jest
- **Integration Testing:** Mercado Pago Sandbox
- **API Testing:** Postman o curl
- **Webhook Testing:** ngrok o similar

## Plan de Ejecución

1. Configurar entorno de testing
2. Configurar sandbox de Mercado Pago
3. Ejecutar pruebas unitarias
4. Ejecutar pruebas de integración con sandbox
5. Ejecutar pruebas de edge cases
6. Ejecutar pruebas de seguridad
7. Documentar resultados
8. Corregir fallos encontrados
9. Re-ejecutar pruebas fallidas
10. Notificar al usuario cuando todas pasen

## Estado General
**Pruebas unitarias:** 0/9 completadas  
**Pruebas de integración:** 0/4 completadas  
**Pruebas de edge cases:** 0/6 completadas  
**Pruebas de seguridad:** 0/4 completadas  
**Pruebas de sandbox:** 0/2 completadas  
**Total:** 0/25 completadas
