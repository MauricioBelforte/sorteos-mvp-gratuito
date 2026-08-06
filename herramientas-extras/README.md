# 🛠️ Herramientas Extras

Carpeta con utilidades y scripts auxiliares del proyecto que **no forman parte del producto en sí**, pero pueden ser útiles para:

- Análisis de webs de la competencia
- Tareas de mantenimiento
- Experimentación

> **Regla:** Todo lo que esté dentro de `herramientas-extras/` NO debe deployarse junto con el producto y NO debe ser requerido por la app principal.

---

## 📁 Estructura actual

```
herramientas-extras/
├── README.md                  ← este archivo
└── scraping-web/              ← scripts para analizar webs externas
    ├── README.md              ← documentación específica de scraping
    ├── *.ts / *.ps1           ← los scripts
    └── outputs/               ← HTMLs, JSONs, screenshots, bundles JS
        └── (resultados)
```

---

## 🔧 Subcarpetas

| Carpeta | Propósito |
|---------|-----------|
| `scraping-web/` | Scripts con Playwright para extraer información de webs externas (precios, contenido, bundles JS, etc.) |

---

## 🚫 ¿Qué NO va acá?

- Código del producto (`api/`, `web/`)
- Documentación de componentes (`DOCUMENTACION/`)
- Logs del sistema (`Logs/`)

Si tenés dudas sobre dónde va algo nuevo, consultá el `AGENTS.md` raíz.
