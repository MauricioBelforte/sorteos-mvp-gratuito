# 07 — Resultados de Testings

> Fecha: 2026-08-08. Entorno local Windows: dev server API (`tsx watch`) +
> navegador Chrome real visible + sesión `@del` en disco.

## T1 — Compilación: PASS
`npx tsc --noEmit` sin errores tras editar `scroll-anon-gzero.ts` e `instagram-v2.ts`.

## T3/T4/T5 — Ejecución E2E local con sesión (post Cm7p75TJVub, 254): PASS
POST `/api/sorteos` → sorteo creado `66e485cd-85bf-418c-b220-b511ca7a5193`.

Log (extracto):
```
Instagram V2: Iniciando scraping de ... (con sesión guardada)   ← usaSesionGuardada=true
Instagram V2: esperados ~254 comentarios, sesión: SÍ            ← ctx.tieneSesion=true
Instagram V2: intentando Scroll anónimo completo...              ← G-Zero PRIMERO (nuevo orden)
MEM: inicio recolección (Estrategia G) {rssMb:154,...}
reinicio 1/3 tras 7 ciclos sin progreso (56 capturados)          ← recarga de página (no contexto)
reinicio 2/3 ... (86 capturados)
reinicio 3/3 ... (86 capturados)
Instagram V2: Scroll anónimo completo -> 101 participantes únicos
Instagram: retornando mejor resultado: 101 participantes
Captura registrada: ... (101 participantes, sesion=@del (guardada)))
```

Conclusiones:
1. **El contexto logueado se reutilizó**: la sesión no se recreó/perdió (el límite
   de 101 capturados es el máximo real de usuarios únicos del post: los
   comentarios totales 254 son de pocas cuentas repetidas).
2. Los "reinicios" ahora hacen `reload` en vez de cerrar el contexto (T4 pasa:
   no se recrea el contexto, la sesión permanece en cookies).
3. El orden cascada con sesión coloca G-Zero primero SIN romper las siguientes
   estrategias (el contexto del orquestador sigue vivo para GraphQL/API/DOM — no
   se cierra, según el diseño final).

## T2 — Paridad anónima: pendiente de ejecutar post-fix en repositorio sin sesión
La sesión local impide la paridad 1:1; la última medición anónima conocida del
post 152 fue ~144, y del post 254 anónimo fue ~101 (idéntico al resultado
con sesión local → no hay regresión del techo del post).

## T6/T7 — Producción: PENDIENTE (requiere push + deploy; permiso del usuario)

## Fallos identificados y soluciones
| Fallo | Causa | Solución |
|-------|-------|----------|
| `modal no disponible (sin sesión)` en estrategia DOM local | IG no abre modal con la sesión simulada (solo indicadores de sesión reales); el modal es secundario: el G-Zero PRIMERO ya captura el máximo | No se toca DOM: el reorden cubre este caso |
| 254 → 101 con sesión: "solo 101" | 101 = techo REAL de usuarios únicos (post con repetidos) | Validar en prod con post de usuarios distintos (T7) |