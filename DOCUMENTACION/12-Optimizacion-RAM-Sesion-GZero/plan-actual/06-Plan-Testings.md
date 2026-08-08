# 06 — Plan de Testings

> Testings profesional previo a la primera prueba manual del usuario (AGENTS §14).
> Objetivo: validar que el reorden de la cascada con sesión (G-Zero PRIMERO
> reutilizando el contexto logueado del orquestador) captura igual o mejor
> que antes, sin romper la paridad anónima.

## Escenarios

| ID | Escenario | Entorno | Criterio de éxito |
|----|-----------|---------|-------------------|
| T1 | Compilación | Local | `tsc --noEmit` sin errores |
| T2 | Paridad anónima | Local (sin sesión en disco) | Post 152 (`C347268uDMm`) ≈ 144 participantes |
| T3 | Sesión reutilizada | Local (sesión `@del` en disco) | Post 254 (`Cm7p75TJVub`): con sesión → igual o mayor cantidad que anónimo; sin crash; contexto NO recreado para no perder sesión |
| T4 | Reinicio/recarga con sesión | Local | `recargarPaginaGZero` usa reload (no cierra el contexto logueado) |
| T5 | Máximo real post 254 | Local | 101 ≈ techo real de usuarios únicos del post (repetidos maria_noelia8) |
| T6 | Prod: post 254 tras deploy | Render free | Captura >= 101 (base anónima actual) y preferiblemente >= 127 (50%) |
| T7 | Prod: post 1034 (histórico) | Render free | Captura >= 611 (paridad con la madrugada que usaba la página logueada del orquestador) |
| T8 | RAM governor | Prod | Con sesión, `MEM: inicio recolección (Estrategia G)` sin OOM ni reciclaje en revolote de la sesión |

## Resultado esperado vs real
- T1: ✓ (tsc pasa)
- T2: igual que última ejecución
- T3: mismo resultado anónimo local (≈101) — la paridad de usuarios únicos
- T4: al ejecutar, log demuestra "reinicio ... (con sesión)" sin cerrar contexto
- T6/T7: pendiente deploy → requiere push (permiso del usuario)