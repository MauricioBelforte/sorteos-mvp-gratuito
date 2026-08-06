# 🕷️ Scraping Web

Scripts para extraer información de páginas web externas usando **Playwright** (Chromium headless).

> Estos scripts se usaron originalmente para analizar precios de [instasorteos.com](https://instasorteos.com/) pero están **diseñados para reutilizarse contra cualquier web**.

---

## 📋 Contenido

| Archivo | Descripción | Cuándo usarlo |
|---------|-------------|---------------|
| `scrape-instasorteos-precios.ts` | **v1**: scraping básico con `fetch_webpage` y primer intento headless. | Como referencia histórica. |
| `scrape-instasorteos-precios-v2.ts` | **v2**: espera activa de hidratación Angular + scroll para lazy-load. | SPAs Angular/React/Vue que cargan tarde. |
| `scrape-instasorteos-precios-v3.ts` | **v3**: home primero + navegación interna + captura de errores JS. | SPAs que requieren "calentamiento" desde home. |
| `scrape-instasorteos-precios-v4.ts` | **v4**: inspección de bundles JS y scripts cargados. | Útil para entender qué chunks cargar antes de hacer scraping. |
| `scrape-instasorteos-precios-v5.ts` | **v5**: interacción con sliders de UI (rango, click, drag). | Webs con precios dinámicos detrás de un slider/control. |
| `scrape-instasorteos-precios-v6.ts` | **v6 final**: click en elemento de navegación + captura robusta. | **Recomendado para empezar.** |
| `download-chunks.ps1` | Descargador batch de bundles JS + filtro por palabras clave. | Útil para análisis offline de Angular/React/Vue. |

---

## 🚀 Uso rápido contra cualquier web

### 1. Requisitos

- Node.js 18+
- Playwright instalado y con Chromium descargado:

```bash
cd api  # o donde tengas Playwright como dependencia
npm install
npx playwright install chromium
```

> **Tip:** Estos scripts están en `herramientas-extras/`, no en `api/`. Podés crear un `package.json` propio acá o apuntar al `node_modules` de `api/`:
>
> ```bash
> cd herramientas-extras/scraping-web
> cp ../../api/package.json .   # solo si necesitás playwright localmente
> npx tsx scrape-instasorteos-precios-v6.ts
> ```

### 2. Adaptar a una nueva web

Editá la constante `URL` en el script que elijas. Por ejemplo en `scrape-instasorteos-precios-v6.ts`:

```typescript
const URL = 'https://TU-WEB-AQUI.com/precios';
```

Y opcionalmente ajustá los selectores en la sección `// Buscar el boton PRECIOS y hacer click` o `// Buscar inputs tipo range o slider`.

### 3. Ejecutar

```bash
# Desde la raíz del proyecto
npx tsx herramientas-extras/scraping-web/scrape-instasorteos-precios-v6.ts
```

> Si te tira error de que no encuentra `playwright`, asegurate de tener Playwright instalado. Podés copiar el `node_modules` desde `api/` o instalar localmente:
>
> ```bash
> cd herramientas-extras/scraping-web
> npm init -y
> npm install playwright
> npx playwright install chromium
> ```

### 4. Revisar los outputs

Todos los outputs se guardan en `outputs/`:

```
outputs/
├── NOMBRE-WEB-precios.png         ← screenshot full-page
├── NOMBRE-WEB-precios.html        ← HTML renderizado por la SPA
├── NOMBRE-WEB-precios.json        ← bodyText + candidatos a precio + responses API
└── chunks/                        ← bundles JS descargados (si usaste download-chunks.ps1)
```

---

## 🧠 Lecciones aprendidas (de instasorteos.com)

1. **Las SPAs Angular/React/Vue NO exponen contenido en el HTML inicial.** Usá Playwright, no `fetch`.
2. **`networkidle` puede colgarse para siempre** si la web tiene analytics/chat persistente. Usá `domcontentloaded` + esperas explícitas.
3. **Algunos componentes son stubs.** Si ves `prices works!` o similar hardcodeado, es probable que el contenido real esté detrás de login.
4. **El bundle JS tiene la lógica de negocio.** Descargá los chunks y grepeá por palabras clave (precio, plan, etc.).
5. **El scroll fuerza el lazy-load.** Siempre hacé scroll completo antes de capturar.

---

## 💡 Casos de uso

- Comparar precios de competidores
- Auditar qué APIs internas llama una web
- Documentar componentes de una SPA
- Análisis de bundles JS para entender arquitectura
- Pruebas de humo contra deploys propios
