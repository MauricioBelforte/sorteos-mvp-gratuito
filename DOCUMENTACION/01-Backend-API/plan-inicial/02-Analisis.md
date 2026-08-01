# Análisis - Backend API

## Análisis del Dominio

### Dominio de Sorteos
- Sistema de sorteos online para redes sociales
- Usuarios crean sorteos basados en publicaciones
- Sistema recolecta comentarios automáticamente
- Sistema selecciona ganadores de forma determinística
- Usuarios pueden verificar resultados con hash

### Dominio de Autenticación
- Usuarios se registran con email y contraseña
- Sistema genera tokens JWT para sesiones
- Contraseñas se hashean con bcrypt
- Tokens expiran después de 24 horas

### Dominio de Pagos
- Usuarios pagan por sorteo individual
- Integración con Mercado Pago
- Webhooks para notificaciones de pago
- Verificación de firmas de seguridad

## Alternativas Consideradas

### Alternativa 1: Usar APIs Oficiales de Redes Sociales
**Ventajas:**
- Más estable y confiable
- Menos mantenimiento

**Desventajas:**
- Requiere pago (Twitter API, Facebook API)
- No cumple objetivo de MVP gratuito

**Decisión:** Rechazada - No cumple requisito de gratuito

### Alternativa 2: Usar Servicios de Scraping Terceros
**Ventajas:**
- Menos desarrollo propio
- Posiblemente más estable

**Desventajas:**
- Costo adicional
- Dependencia de terceros

**Decisión:** Rechazada - Se prefiere control total con Playwright

### Alternativa 3: SQLite vs PostgreSQL
**Ventajas de SQLite:**
- Sin configuración adicional
- Ideal para desarrollo local
- Portabilidad

**Ventajas de PostgreSQL:**
- Mejor para producción
- Escalabilidad
- Soporte de Supabase gratuito

**Decisión:** SQLite para desarrollo, PostgreSQL para producción (Supabase)

## Decisiones Técnicas

### Framework: Express.js
- Ligero y flexible
- Amplia comunidad
- Compatible con TypeScript
- Middleware robusto

### ORM: Prisma
- Type-safe
- Migraciones automáticas
- Soporte para SQLite y PostgreSQL
- Developer experience excelente

### Scraping: Playwright
- Soporte para headless
- Manejo de JavaScript dinámico
- Multi-navegador
- APIs modernas

### Autenticación: JWT + bcrypt
- JWT: Stateless, escalable
- bcrypt: Hashing seguro de contraseñas
- Estándar de industria

### Pagos: Mercado Pago SDK
- SDK oficial
- Soporte para Latinoamérica
- Webhooks robustos
- Sandbox para pruebas

## Arquitectura Decidida

### Estructura de Carpetas
```
api/
├── src/
│   ├── routes/          ← Rutas Express
│   ├── lib/             ← Lógica compartida
│   └── collectors/       ← Scraping
├── prisma/              ← Esquema DB
└── index.ts             ← Entry point
```

### Separación de Responsabilidades
- Rutas: Solo manejo de HTTP
- Lib: Lógica de negocio
- Collectors: Scraping específico

## Riesgos Identificados

### Riesgo 1: Scraping Puede Fallar
**Mitigación:**
- Timeout de 30 segundos
- Manejo de errores robusto
- Fallback a mensajes de error claros

### Riesgo 2: Mercado Pago Puede Cambiar API
**Mitigación:**
- Usar SDK oficial
- Versionar dependencias
- Monitorear cambios

### Riesgo 3: SQLite No Escala
**Mitigación:**
- Solo para desarrollo
- PostgreSQL para producción
- Migración con Prisma

## Consideraciones de Seguridad

### Autenticación
- Tokens JWT con expiración
- Contraseñas hasheadas
- Middleware de autenticación

### Webhooks
- Verificación de firma HMAC-SHA256
- Secret en variables de entorno
- Rechazo de firmas inválidas

### Rate Limiting
- Límite de 3 sorteos por mes
- Validación en backend
- Prevención de abuso
