# Plan de Testings - Frontend Web

## Objetivo
Identificar bugs y fallos antes de la primera prueba manual del usuario.

## Tipos de Pruebas

### 1. Pruebas Unitarias

#### 1.1 Cliente API
- **Test:** fetchAPI() con token válido
  - Input: Token válido en localStorage
  - Expected: Request exitoso con header Authorization
  - Status: Pendiente

- **Test:** fetchAPI() sin token
  - Input: Sin token en localStorage
  - Expected: Redirección a /auth/login
  - Status: Pendiente

- **Test:** register() con datos válidos
  - Input: `{ email, password, nombre }` válidos
  - Expected: Usuario registrado, token guardado
  - Status: Pendiente

- **Test:** login() con credenciales válidas
  - Input: `{ email, password }` válidos
  - Expected: Token guardado, redirección a dashboard
  - Status: Pendiente

#### 1.2 Componentes
- **Test:** RegisterPage maneja submit
  - Input: Formulario con datos válidos
  - Expected: Llama a register(), redirige a dashboard
  - Status: Pendiente

- **Test:** LoginPage maneja submit
  - Input: Formulario con datos válidos
  - Expected: Llama a login(), redirige a dashboard
  - Status: Pendiente

- **Test:** DashboardPage carga sorteos
  - Input: Usuario autenticado
  - Expected: Carga sorteos del usuario
  - Status: Pendiente

### 2. Pruebas de Integración

#### 2.1 Flujo Completo de Registro
- **Test:** Registro → Dashboard
  - Steps:
    1. Acceder a /auth/register
    2. Ingresar datos válidos
    3. Submit formulario
    4. Verificar redirección a dashboard
    5. Verificar token en localStorage
  - Expected: Flujo completo sin errores
  - Status: Pendiente

#### 2.2 Flujo Completo de Login
- **Test:** Login → Dashboard
  - Steps:
    1. Acceder a /auth/login
    2. Ingresar credenciales válidas
    3. Submit formulario
    4. Verificar redirección a dashboard
    5. Verificar token en localStorage
  - Expected: Flujo completo sin errores
  - Status: Pendiente

#### 2.3 Flujo Completo de Sorteo
- **Test:** Dashboard → Crear Sorteo → Detalle
  - Steps:
    1. Acceder a /dashboard
    2. Ingresar datos de sorteo
    3. Crear sorteo
    4. Verificar sorteo en lista
    5. Acceder a detalle
    6. Verificar ganadores y hash
  - Expected: Flujo completo sin errores
  - Status: Pendiente

### 3. Pruebas de Edge Cases

#### 3.1 Validación de Formularios
- **Test:** Registro sin email
  - Input: Formulario sin email
  - Expected: Error de validación
  - Status: Pendiente

- **Test:** Registro sin password
  - Input: Formulario sin password
  - Expected: Error de validación
  - Status: Pendiente

- **Test:** Login sin credenciales
  - Input: Formulario vacío
  - Expected: Error de validación
  - Status: Pendiente

#### 3.2 Manejo de Errores
- **Test:** API retorna error 500
  - Input: API falla
  - Expected: Mensaje de error mostrado al usuario
  - Status: Pendiente

- **Test:** API retorna error 401
  - Input: Token expirado
  - Expected: Redirección a login
  - Status: Pendiente

#### 3.3 Estado de Carga
- **Test:** Loading durante request
  - Input: Request en progreso
  - Expected: Indicador de loading visible
  - Status: Pendiente

### 4. Pruebas de SEO

#### 4.1 Meta Tags
- **Test:** Meta tags generados correctamente
  - Input: Acceder a cualquier página
  - Expected: Meta tags presentes en HTML
  - Status: Pendiente

- **Test:** Open Graph tags
  - Input: Acceder a cualquier página
  - Expected: OG tags presentes en HTML
  - Status: Pendiente

#### 4.2 Structured Data
- **Test:** JSON-LD presente
  - Input: Acceder a home
  - Expected: JSON-LD script presente
  - Status: Pendiente

### 5. Pruebas de Responsive Design

#### 5.1 Mobile
- **Test:** Layout en móvil
  - Input: Viewport móvil (375px)
  - Expected: Layout responsive correcto
  - Status: Pendiente

#### 5.2 Tablet
- **Test:** Layout en tablet
  - Input: Viewport tablet (768px)
  - Expected: Layout responsive correcto
  - Status: Pendiente

#### 5.3 Desktop
- **Test:** Layout en desktop
  - Input: Viewport desktop (1920px)
  - Expected: Layout responsive correcto
  - Status: Pendiente

## Criterios de Éxito

- Todas las pruebas unitarias pasan
- Todas las pruebas de integración pasan
- Todas las pruebas de edge cases pasan
- Todas las pruebas de SEO pasan
- Todas las pruebas de responsive design pasan
- Sin errores de hidratación
- Sin errores en consola
- Frontend carga en menos de 2 segundos

## Herramientas de Testing

- **Unit Testing:** Jest + React Testing Library
- **E2E Testing:** Playwright o Cypress
- **SEO Testing:** Lighthouse, SEO tools
- **Responsive Testing:** Chrome DevTools

## Plan de Ejecución

1. Configurar entorno de testing
2. Ejecutar pruebas unitarias
3. Ejecutar pruebas de integración
4. Ejecutar pruebas de edge cases
5. Ejecutar pruebas de SEO
6. Ejecutar pruebas de responsive design
7. Documentar resultados
8. Corregir fallos encontrados
9. Re-ejecutar pruebas fallidas
10. Notificar al usuario cuando todas pasen

## Estado General
**Pruebas unitarias:** 0/8 completadas  
**Pruebas de integración:** 0/3 completadas  
**Pruebas de edge cases:** 0/6 completadas  
**Pruebas de SEO:** 0/3 completadas  
**Pruebas de responsive design:** 0/3 completadas  
**Total:** 0/23 completadas
