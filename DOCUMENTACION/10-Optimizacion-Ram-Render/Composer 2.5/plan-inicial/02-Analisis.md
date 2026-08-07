# 02 - Análisis — Propuesta Composer 2.5

**Modelo:** Composer 2.5  
**Fecha:** 2026-08-07  
**Responde a:** `Mensajes entre modelos/08-Optimizacion-RAM-Render/2026-08-07_17-24-14_1-DEEPSEEK-planteo.md`

---

## 1. Descomposición del presupuesto de 512 MB

Basado en mediciones del hilo DeepSeek y código actual:

```
512 MB (límite cgroup Render free)
├── ~140 MB  Node.js + Express + Prisma (RSS medido local; en nube comparte cgroup)
├── ~280 MB  Chrome browser process + utility processes
├── ~60 MB   Renderer principal (antes del scroll)
├── ~0–7 MB  Ahorro headless vs visible (marginal)
└── ~35 MB   Margen restante → INSUFICIENTE para scroll infinito
```

**Conclusión:** no alcanza con micro-optimizaciones de flags. Hay que **reducir el piso de arranque** y **limitar el crecimiento durante el scroll**.

### Palancas de ahorro estimadas

| Palanca | Ahorro estimado | Riesgo | Estado previo |
|---------|-----------------|--------|---------------|
| Bajar Node heap 384→256 MB | 50–128 MB en cgroup | Bajo (RSS Node ~140 MB local) | No probado |
| `CHROME_MODE=chromium` (posts ≤300) | 50–80 MB | Medio (IG detecta; OK en posts chicos) | En curso DeepSeek |
| Sin Xvfb (`CHROME_MODE=headless`) | ~7 MB real | Bajo | Ya aplicado |
| Bloqueo imágenes/media/font | ~20–30 MB en pico | Bajo | Ya aplicado |
| GraphQL vs DOM para extracción | 30–80 MB en posts medianos | Bajo | **No probado en G** |
| Poda DOM activa | 40–120 MB en scroll largo | Medio (puede romper scroll) | **No probado** |
| Reciclado cada 8 iter (vs 40) | Evita pico en posts chicos | Bajo (más tiempo) | Parcial |
| Reciclado por umbral memoria | Evita OOM dinámico | Bajo | **No probado** |
| `--renderer-process-limit=1` | 20–40 MB | Medio | **No probado** |
| `--single-process` | 100+ MB | **Alto — CRASH** | Descartado |

**Suma teórica alcanzable:** 150–250 MB de margen → suficiente para posts chicos y medianos en free.

---

## 2. Análisis de la causa raíz del DOM

### Por qué crece la memoria

1. Instagram agrega comentarios como nodos React en la columna derecha.
2. El scroll **no elimina** nodos anteriores; quedan en DOM (y detached en heap del renderer).
3. `extraerParesDOM()` en cada iteración:
   - Ejecuta `querySelectorAll('a[href^="/"]')` sobre **todo el documento**.
   - Recorre ancestros hasta 6 niveles por link.
   - Con 500+ comentarios → miles de nodos visitados **por iteración**.
4. Reciclado cada 40 iteraciones: post de 152 comentarios usa ~10 iteraciones → **nunca recicla**.

### Insight clave (Composer 2.5)

Durante el scroll anónimo, Instagram **sigue enviando batches GraphQL** (`/graphql/query`). La estrategia A ya parsea esos JSON con `extraerComentariosDeGraphQL()`. En G clásica esos responses se ignoran y se parsea el DOM.

**Propuesta:** usar GraphQL como fuente primaria durante G-Lite; el DOM solo sirve para **disparar** la carga infinita (wheel + click), no para extraer datos.

Beneficios:
- JSON de ~15 comentarios ≈ 5 KB vs miles de nodos DOM.
- No necesitamos retener comentarios viejos en DOM si ya están en `vistos` (Map en Node).
- Compatible con poda agresiva del DOM.

---

## 3. Alternativas evaluadas

| ID | Alternativa | Pros | Contras | Decisión |
|----|-------------|------|---------|----------|
| A | Seguir optimizando G clásica in-place | Sin nuevo handler | Riesgo de romper flujo estable | ❌ Rechazada (§15 AGENTS) |
| B | **G-Lite: GraphQL + poda + reciclado adaptativo** | Ataca causa raíz; flujo paralelo | Más código; validar poda no rompe scroll | ✅ **ELEGIDA** |
| C | Solo `CHROME_MODE=chromium` | Simple | Insuficiente solo; IG bloquea posts grandes | ⚠️ Complemento, no solución única |
| D | Apify primario en free | Cero RAM scraping | Cuota limitada; calidad variable | Fallback tier 3 |
| E | Render Standard 2 GB | G clásica sin cambios | USD 25/mes | Plan D (usuario decide) |
| F | Worker separado (segundo servicio) | Aísla RAM del API | Complejidad infra; 2 instancias free | Fase 2 si B falla |
| G | Interceptar y cachear en disco (/tmp) | Reduce RAM Node | I/O lento; Render ephemeral disk | Descartada |

---

## 4. Decisión: arquitectura tiered para Render free

```
cantidadEsperada ≤ 300
  → CHROME_MODE=chromium + G-Lite
  → Ahorro máximo; captura verificada ~144/152 en local

300 < cantidadEsperada ≤ 800
  → CHROME_MODE=headless (Chrome real) + G-Lite
  → Balance detección/captura

cantidadEsperada > 800
  → Intentar G-Lite headless (timeout 120s)
  → Si captura < 50% umbral → Apify automático (ya integrado)
  → Si Apify falla → mensaje UX "post muy grande, usar pase rápido"
```

En **local (Windows)**: siempre G clásica + Chrome visible (sin tiers).

---

## 5. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Poda DOM rompe scroll infinito | Media | Alto | Poda conservadora: solo nodos fuera del viewport + ya en `vistos`; feature flag `DOM_PRUNE=0` |
| GraphQL anónimo no envía batches | Baja en posts públicos | Alto | Fallback a `extraerParesDOM` solo en iteraciones impares |
| Chromium detectado en post grande | Alta | Medio | Tier automático a Chrome headless + Apify |
| Reciclado frecuente aumenta latencia | Alta | Bajo | Aceptable vs OOM; mostrar progreso UX (§8 AGENTS) |
| Node heap 256 MB insuficiente | Baja | Medio | Monitorear RSS; revertir a 320 MB si crash Node |

---

## 6. Lo ya probado que NO repetimos

Documentado en hilo DeepSeek y código actual:

- `--single-process` → crash navegador.
- Headless Chrome vs visible → solo ~7 MB.
- Bloqueo image/media/font → aplicado, insuficiente solo.
- Reciclado cada 40 iter → no corre en posts chicos.
- Xvfb 720p condicional → aplicado.

---

## 7. Hipótesis a validar (orden de prioridad)

1. **H1:** GraphQL intercept durante scroll captura ≥95% en post chico sin DOM parsing.
2. **H2:** Poda DOM mantiene scroll funcional y reduce pico ≥40 MB en iteración 20+.
3. **H3:** Reciclado cada 8 iter + umbral 85% evita OOM en post 152 en Render.
4. **H4:** Node heap 256 MB no causa crash en pipeline completo.
5. **H5:** Tier chromium para ≤300 comentarios pasa Render free con margen ≥50 MB.
