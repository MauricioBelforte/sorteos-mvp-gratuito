# Requerimientos - Backend API

## Problema
Crear una API REST para el MVP de sorteos gratuitos que permita:
- Autenticación de usuarios
- Creación y gestión de sorteos
- Scraping de comentarios de redes sociales
- Integración de pagos con Mercado Pago

## Objetivos
- Implementar sistema de autenticación JWT
- Implementar motor de sorteos determinístico
- Implementar scraping de Instagram, TikTok, YouTube
- Implementar integración de pagos Mercado Pago
- Limitar a 3 sorteos por mes por usuario (plan free)

## Alcance
- Rutas de autenticación (register, login, /me)
- Rutas de sorteos (crear, listar, obtener)
- Rutas de pagos (checkout, webhook)
- Scraping de 3 redes sociales
- Motor de sorteos con verificación

## Restricciones
- No usar APIs de pago (Twitter, Facebook)
- Usar solo scraping para recolección de comentarios
- Base de datos SQLite para desarrollo local
- Solo redes sociales: Instagram, TikTok, YouTube
- Límite de 3 sorteos por mes por usuario

## Criterios de Éxito
- API responde en menos de 500ms para endpoints de auth
- Scraping completa en menos de 30 segundos
- Motor de sorteos es determinístico y verificable
- Integración de Mercado Pago funciona correctamente
