# ===== Deploy de la API en Render (Docker) =====
# Necesita Chrome real + Xvfb para la Estrategia G de Instagram
# (scroll anónimo completo, verificado 2026-08-05). Playwright con
# --with-deps instala las librerías del sistema necesarias.

FROM node:20-slim

WORKDIR /app

# Cota el heap de Node: deja RAM disponible para Chrome real + Xvfb dentro del
# plan free de Render (512 MB). Chrome se lanza con flags de bajo consumo.
ENV NODE_OPTIONS=--max-old-space-size=384

# Copiar el repo completo (monorepo con workspaces: api, web, shared-modules/*)
COPY . .

# Instalar xauth y xvfb (display virtual para Chrome visible de la Estrategia G)
RUN apt-get update && apt-get install -y --no-install-recommends xauth xvfb && rm -rf /var/lib/apt/lists/*

# Instalar dependencias del workspace (raíz) y compilar solo la API
RUN npm install --no-audit --no-fund --workspaces

WORKDIR /app/api

# Playwright: instalar Chromium y Chrome real (canal "chrome") con deps del SO,
# SIEMPRE DESPUÉS del npm install y DESDE /app/api, donde el binario "playwright"
# queda disponible (es dependencia del workspace "api"). Fallo = build falla.
RUN npm exec playwright -- install --with-deps chromium chrome
RUN npx prisma generate
RUN npm run build

EXPOSE 4000

# Display virtual para Chrome visible (headful) de la Estrategia G.
# Con CHROME_MODE=headless (nube free, 512 MB) NO se arranca Xvfb: el Chrome real
# headless nuevo no necesita ventana y se ahorran ~80-100 MB del contenedor,
# dejando margen real para el scroll infinito (módulo 10, 2026-08-07).
# Sin CHROME_MODE (visible, default) se arranca Xvfb 720p como antes.
CMD ["sh", "-c", "if [ -z \"$CHROME_MODE\" ]; then Xvfb :99 -screen 0 1280x720x24 -ac >/tmp/xvfb.log 2>&1 & export DISPLAY=:99; i=0; until [ -S /tmp/.X11-unix/X99 ] || [ $i -ge 15 ]; do sleep 1; i=$((i+1)); done; if [ -S /tmp/.X11-unix/X99 ]; then echo 'Xvfb listo en :99'; else echo 'AVISO: Xvfb no respondió en :99'; cat /tmp/xvfb.log 2>/dev/null; fi; else echo \"CHROME_MODE=$CHROME_MODE: sin Xvfb (ahorro RAM)\"; fi; exec node dist/index.js"]