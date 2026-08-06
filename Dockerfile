# ===== Deploy de la API en Render (Docker) =====
# Necesita Chrome real + xvfb para la Estrategia G de Instagram
# (scroll anónimo completo, verificado 2026-08-05). Playwright con
# --with-deps instala las librerías del sistema necesarias.

FROM node:20-slim

WORKDIR /app

# Copiar el repo completo (la API depende de file:../shared-modules/mercadopago)
COPY . .

# Playwright: instalar Chromium + Chrome real (canal "chrome") con deps del SO.
# pnpm/npm-run user root. Los browsers quedan en ~/.cache/ms-playwright.
# xauth es requerido por xvfb-run al arrancar el contenedor.
RUN npx playwright install --with-deps chromium chrome || npx playwright install chromium
RUN apt-get update && apt-get install -y --no-install-recommends xauth && rm -rf /var/lib/apt/lists/*

# Instalar dependencias de la API y compilar
WORKDIR /app/api
RUN npm install --no-audit --no-fund
RUN npx prisma generate
RUN npm run build

EXPOSE 4000

# xvfb-run: provee display virtual para Chrome visible (headful) de la Estrategia G
CMD ["xvfb-run", "-a", "node", "dist/index.js"]