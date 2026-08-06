# 05 - Checklist - Módulo de Mejoras UI

## Requerimientos del Usuario (OBLIGATORIOS)

- [ ] **Incluir una imagen del sorteo** (mostrar imagen de la publicación en el preview)
- [ ] **Mostrar cantidad de comentarios** detectados (ej: "Cantidad de comentarios: 152")
- [ ] **Poder elegir y cambiar la cantidad de ganadores** (ej: "Cantidad de Ganadores: 1")
- [ ] **Poder elegir y cambiar la cantidad de suplentes** (ej: "¿Cuántos suplentes? 1")
- [ ] **Botón de sortear** que ejecuta el sorteo con la configuración elegida
- [ ] **Animación que pasa por todos los comentarios** hasta que frena en el ganador (efecto ruleta)
- [ ] **Calidad premium**: diseño cuidado, animaciones suaves, micro-interacciones

## Diseño Agregado por el Equipo

### Backend
- [ ] Crear helper `extraerImagenPublicacion()` con estrategias por red social
- [ ] Crear endpoint `POST /api/sorteos/analizar` (nuevo router, no tocar sorteos.ts)
- [ ] Montar router en index.ts
- [ ] Validaciones (URL soportada, límites de ganadores/suplentes)

### Frontend
- [ ] Crear `web/lib/sorteos.ts` con helpers compartidos
- [ ] Crear `SorteoWizard.tsx` con flujo en 2 pasos
- [ ] Crear `RuletaGanadores.tsx` con animación de frenado
- [ ] Soporte multi-ganadores y suplentes en `ResultCard.tsx`
- [ ] Actualizar `page.tsx` para usar el wizard
- [ ] Loading states y prevención de doble click
- [ ] Manejo de errores (red no soportada, servidor caído, sin comentarios)

### Calidad
- [ ] Responsive design (móvil/tablet/desktop)
- [ ] Accesibilidad (aria-live en animación, contraste, reduced-motion)
- [ ] Sin errores de consola ni de tipos
- [ ] Build exitoso backend y frontend
- [ ] Testing (plan + ejecución + resultados)

### Documentación
- [ ] Crear módulo DOCUMENTACION/05-Mejoras-UI/ (plan-inicial + plan-actual)
- [ ] Actualizar DOCUMENTACION/README.md
- [ ] Actualizar 3-DOCUMENTO-TAREAS-ACTUAL.md
- [ ] Log en Logs/ y actualizar ULTIMO_NUMERO.txt
- [ ] Actualizar ESTADO-PARALELO.md
- [ ] Crear hilo Mensajes entre modelos/03-Mejoras-UI/
