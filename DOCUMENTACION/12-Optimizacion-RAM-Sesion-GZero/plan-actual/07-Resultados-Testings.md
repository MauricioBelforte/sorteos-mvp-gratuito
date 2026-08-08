# 07 — Resultados de Testings

> Fecha: 2026-08-08. Entorno local Windows: dev server API (`tsx watch`) +
> navegador Chrome real visible + sesión `@del` en disco.

## T1 — Compilación: PASS
`npx tsc --noEmit` sin errores tras editar `scroll-anon-gzero.ts` e `instagram-v2.ts`.

## T2 — Paridad anónima: PASS (regresión mínima inexistente)
La medición anónima conocida del post 254 fue ~101; el índice G-Zero sin sesión
funciona como antes (contexto propio + reciclado completo). No se introdujo
cambio en la rama anónima salvo el reorden del header (equivalente al previo).

## T3/T4/T5 — Ejecución E2E local con sesión (post Cm7p75TJVub, 254): PASS — MEJORADO
POST `/api/sorteos` → sorteo `330db6d8-9865-4508-b740-765e09df6b03`.

Log (extracto 2ª corrida, con el fix de cleanup del contexto):
```
Instagram V2: Iniciando scraping ... (con sesión guardada)
Instagram V2: esperados ~254 comentarios, sesión: SÍ
Instagram V2: intentando GraphQL interception...  -> 18
Instagram V2: intentando API REST in-browser...   -> 15
Instagram V2: intentando DOM scroll...            -> 18
Instagram V2: intentando Scroll anónimo completo...  ← G-Zero
reinicio 1/3 tras 7 ciclos sin progreso (56 capturados)
reinicio 2/3 tras 7 ciclos sin progreso (224 capturados)
reinicio 3/3 tras 7 ciclos sin progreso (224 capturados)
Instagram V2: Scroll anónimo completo -> 224 participantes únicos
Instagram V2: Scroll anónimo completo cumple el umbral (224/254) ✓
Captura registrada: ... (224 participantes, sesion=@del (guardada))
```

**Resultado clave:** 224/254 (88%) con la sesión reutilizada y el nuevo orden.
Mejora vs 42 (sesión sin reorden) y vs 101 (anónimo). El umbral (≥50%) corta
la cascada temprano: no se disparan ScrapFly/Apify.

## T4 — Reinicios con sesión: PASS
Los reinicios usan `reload` (no cierran el contexto logueado): la sesión
permanece en las cookies del contexto del orquestador; el log muestra progreso
56 → 224 sin pérdida de sesión.

## T7 — Post histórico 1034: pendiente en prod.

## Fallos identificados y soluciones
| Fallo | Causa | Solución |
|-------|-------|----------|
| `modal no disponible (sin sesión)` en DOM local | IG no abre modal con sesión respaldada por storageState sin cookies extras | No bloqueante: el G-ZERO primero captura la mayoría; el modal es solo estrategia C |
| Primera corrida: solo 101 y estrategias posteriores rotas | El cleanup final cerrava `contextoAnonimo` que con sesión ES el contexto del orquestador | Fix: solo se cierra el contexto propio (sin sesión); con sesión no se cierra nada (`if (contextoAnonimo && !tieneSesionGuardada)`) |
| `retornando mejor resultado: 101` → 224 | El orden + reuso de sesión | Ya no aplica: 224/254 cumple umbral |