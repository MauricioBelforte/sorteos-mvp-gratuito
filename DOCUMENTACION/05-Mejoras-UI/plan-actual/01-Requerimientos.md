# 01 - Requerimientos - Módulo de Mejoras UI (Flujo Premium de Sorteo)

## Problema

El flujo actual de la home es básico: se pega una URL, se envía y se muestra el resultado. No permite:
- Ver la imagen de la publicación antes de sortear
- Conocer la cantidad de comentarios detectados antes de decidir
- Elegir cuántos ganadores y suplentes se quieren
- Tener un momento de "sorteo" emocionante y visual

## Objetivos (Requerimientos del Usuario - OBLIGATORIOS)

1. **Incluir una imagen del sorteo**: mostrar la imagen de la publicación (thumbnail/og:image) en el preview.
2. **Mostrar cantidad de comentarios**: ej. "Cantidad de comentarios: 152" con el conteo real detectado.
3. **Poder elegir y cambiar la cantidad de ganadores**: ej. "Cantidad de Ganadores: 1" (editable).
4. **Poder elegir y cambiar la cantidad de suplentes**: ej. "¿Cuántos suplentes? 1" (editable).
5. **Botón de sortear**: accionar el sorteo con la configuración elegida.
6. **Animación que pasa por todos los comentarios hasta que frena en el ganador**: efecto ruleta/slot machine premium que recorre los participantes y frena en el/los ganador/es reales.
7. **Calidad premium**: diseño cuidado, animaciones suaves, micro-interacciones, responsive y accesible.

## Alcance

- **Backend:** nuevo endpoint de análisis de publicación (comentarios + imagen) sin crear sorteo.
- **Frontend:** nuevo flujo "wizard" en la home (analizar → configurar → sortear), componente de animación de ruleta, soporte multi-ganadores en resultados.
- **No incluye:** integración de pagos real (se mantiene el aviso "próximamente"), registro de usuarios.

## Restricciones

- **NO romper** el flujo de sorteos existente (contrato POST `/api/sorteos` intacto).
- El sorteo final debe seguir siendo **determinístico y verificable** (lo calcula el servidor con hash; la animación es solo visual y frena en el ganador real).
- Nuevos componentes/handlers para el nuevo flujo (modularidad, regla 15 de AGENTS.md).
- Seguir el sistema de diseño existente (Tailwind, componentes UI base).
- Documentar todo según AGENTS.md.

## Criterios de Éxito

- Los 7 objetivos del usuario implementados y verificados.
- Build sin errores (backend y frontend).
- Sin regresiones en el flujo existente.
