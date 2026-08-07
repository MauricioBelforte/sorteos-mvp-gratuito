# ===== Deploy de la API en Render (Docker) =====
# Necesita Chrome real + Xvfb para la Estrategia G de Instagram
# (scroll anónimo completo, verificado 2026-08-05). Playwright con
# --with-deps instala las librerías del sistema necesarias.

FROM node:20-slim

WORKDIR /app

# Copiar el repo completo (monorepo con workspaces: api, web, shared-modules/*)
COPY . .

# Playwright: instalar Chromium y Chrome real (canal "chrome") con deps del SO.
# pnpm/npm user root. xauth es requerido por apt de chrome.
RUN npx playwright install --with-deps chromium chrome || npx playwright install chromium
RUN apt-get update && apt-get install -y --no-install-recommends xauth && rm -rf /var/lib/apt/lists/*

# Instalar dependencias del workspace (raíz) y compilar solo la API
RUN npm install --no-audit --no-fund --workspaces
WORKDIR /app/api
RUN npx prisma generate
RUN npm run build

EXPOSE 4000

# Display virtual para Chrome visible (headful) de la Estrategia G.
# Xvfb se arranca en background (-ac desactiva la autorización X, no necesita xauth)
# y node en primer plano: Render detecta el puerto 4000 abierto.
CMD ["sh", "-c", "Xvfb :99 -screen 0 1280x1024x24 -ac > /tmp/xvfb.log 2>&1 & export DISPLAY=:99; sleep 1; exec node dist/index.js"]