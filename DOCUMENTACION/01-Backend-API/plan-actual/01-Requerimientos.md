# Requerimientos - Backend API

## Problema
Crear una API REST para el MVP de sorteos gratuitos que permita:
- Creación de sorteos sin autenticación obligatoria
- Scraping de comentarios de redes sociales
- Modelo de precios por cantidad de comentarios
- Integración de pagos con Mercado Pago (implementación futura)

## Objetivos
- Implementar motor de sorteos determinístico
- Implementar scraping de Instagram, TikTok, YouTube
- Implementar modelo de precios por cantidad de comentarios
- Implementar integración de pagos Mercado Pago (implementación futura)
- Mantener autenticación JWT para implementación futura

## Alcance
- Rutas de autenticación (register, login, /me) - IMPLEMENTACIÓN FUTURA
- Rutas de sorteos (crear, listar, obtener) SIN AUTENTICACIÓN
- Rutas de pagos (checkout, webhook) - IMPLEMENTACIÓN FUTURA
- Scraping de 3 redes sociales
- Motor de sorteos con verificación
- Modelo de precios por cantidad de comentarios

## Restricciones
- No usar APIs de pago (Twitter, Facebook)
- Usar solo scraping para recolección de comentarios
- Base de datos SQLite para desarrollo local
- Solo redes sociales: Instagram, TikTok, YouTube
- Sin límite de sorteos por mes (modelo por cantidad de comentarios)

## Criterios de Éxito
- API responde en menos de 500ms para endpoints de sorteos
- Scraping completa en menos de 30 segundos
- Motor de sorteos es determinístico y verificable
- Modelo de precios funciona correctamente
