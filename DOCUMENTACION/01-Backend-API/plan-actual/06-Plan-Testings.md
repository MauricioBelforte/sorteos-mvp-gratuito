# Plan de Testings - Backend API

## Objetivo
Identificar bugs y fallos antes de la primera prueba manual del usuario.

## Tipos de Pruebas

### 1. Pruebas Unitarias

#### 1.1 Autenticación
- **Test:** Registro de usuario válido
  - Input: `{ email: "test@example.com", password: "password123", nombre: "Test User" }`
  - Expected: Usuario creado, token JWT generado
  - Status: Pendiente

- **Test:** Login con credenciales válidas
  - Input: `{ email: "test@example.com", password: "password123" }`
  - Expected: Token JWT generado
  - Status: Pendiente

- **Test:** Login con credenciales inválidas
  - Input: `{ email: "test@example.com", password: "wrongpassword" }`
  - Expected: Error 401
  - Status: Pendiente

- **Test:** Registro con email duplicado
  - Input: `{ email: "test@example.com", password: "password123", nombre: "Test User 2" }`
  - Expected: Error 400 "Email ya registrado"
  - Status: Pendiente

#### 1.2 Sorteos
- **Test:** Crear sorteo válido
  - Input: `{ titulo: "Sorteo Test", urlPublicacion: "https://instagram.com/p/test", redSocial: "instagram", cantidadGanadores: 1, cantidadSuplentes: 0 }`
  - Expected: Sorteo creado, estado "completado"
  - Status: Pendiente

- **Test:** Crear sorteo sin título
  - Input: `{ urlPublicacion: "https://instagram.com/p/test", redSocial: "instagram", cantidadGanadores: 1 }`
  - Expected: Error 400 "Datos incompletos"
  - Status: Pendiente

- **Test:** Límite de 3 sorteos por mes
  - Input: Crear 4 sorteos en el mismo mes
  - Expected: 4to sorteo retorna error 400 "Límite alcanzado"
  - Status: Pendiente

#### 1.3 Motor de Sorteos
- **Test:** Generación de hash consistente
  - Input: Mismos participantes, mismo timestamp
  - Expected: Mismo hash generado
  - Status: Pendiente

- **Test:** Selección sin repetición
  - Input: 10 participantes, seleccionar 5 ganadores
  - Expected: 5 ganadores únicos
  - Status: Pendiente

### 2. Pruebas de Integración

#### 2.1 Flujo Completo de Sorteo
- **Test:** Registro → Login → Crear Sorteo → Verificar
  - Steps:
    1. Registrar usuario
    2. Login con usuario
    3. Crear sorteo con URL válida
    4. Verificar que se crearon participantes
    5. Verificar que se seleccionaron ganadores
    6. Verificar hash de verificación
  - Expected: Flujo completo sin errores
  - Status: Pendiente

#### 2.2 Integración Mercado Pago
- **Test:** Crear preferencia de pago
  - Input: sorteoId válido
  - Expected: URL de checkout generada
  - Status: Pendiente

### 3. Pruebas de Edge Cases

#### 3.1 Scraping
- **Test:** URL inválida de Instagram
  - Input: URL no válida de Instagram
  - Expected: Error de validación
  - Status: Pendiente

- **Test:** URL sin comentarios
  - Input: URL de post sin comentarios
  - Expected: Lista vacía de participantes
  - Status: Pendiente

- **Test:** Timeout de scraping
  - Input: URL que tarda más de 30 segundos
  - Expected: Error de timeout
  - Status: Pendiente

#### 3.2 Autenticación
- **Test:** Token expirado
  - Input: JWT token expirado
  - Expected: Error 401
  - Status: Pendiente

- **Test:** Token inválido
  - Input: JWT token malformado
  - Expected: Error 401
  - Status: Pendiente

#### 3.3 Pagos
- **Test:** Webhook sin firma
  - Input: Webhook sin header de firma
  - Expected: Error 401 o procesamiento sin verificación
  - Status: Pendiente

- **Test:** Webhook con firma inválida
  - Input: Webhook con firma incorrecta
  - Expected: Error 401
  - Status: Pendiente

### 4. Pruebas de Manejo de Errores

#### 4.1 Errores de Base de Datos
- **Test:** Conexión fallida a DB
  - Input: DATABASE_URL inválido
  - Expected: Error 500 con mensaje claro
  - Status: Pendiente

#### 4.2 Errores de Scraping
- **Test:** Playwright falla al iniciar
  - Input: Error en navegador headless
  - Expected: Error 500 con mensaje claro
  - Status: Pendiente

## Criterios de Éxito

- Todas las pruebas unitarias pasan
- Todas las pruebas de integración pasan
- Todas las pruebas de edge cases pasan
- Todas las pruebas de manejo de errores pasan
- Sin errores en consola durante pruebas
- Tiempo de respuesta < 500ms para endpoints de auth
- Tiempo de scraping < 30 segundos

## Herramientas de Testing

- **Unit Testing:** Jest o Mocha (por definir)
- **Integration Testing:** Supertest
- **Manual Testing:** Postman o curl

## Plan de Ejecución

1. Configurar entorno de testing
2. Ejecutar pruebas unitarias
3. Ejecutar pruebas de integración
4. Ejecutar pruebas de edge cases
5. Ejecutar pruebas de manejo de errores
6. Documentar resultados
7. Corregir fallos encontrados
8. Re-ejecutar pruebas fallidas
9. Notificar al usuario cuando todas pasen

## Estado General
**Pruebas unitarias:** 0/8 completadas  
**Pruebas de integración:** 0/2 completadas  
**Pruebas de edge cases:** 0/6 completadas  
**Pruebas de manejo de errores:** 0/2 completadas  
**Total:** 0/18 completadas
