# Los ejemplos de Calcita en una imagen: para probarlos sin instalar Node ni pnpm (README, «Probar sin instalar nada»).
#
#   docker compose up -d examples      →  http://localhost:8095
#
# Dos etapas: la primera construye el paquete y los ejemplos con las mismas versiones del pnpm-lock.yaml; la segunda solo
# sirve los archivos ya construidos con nginx, sin Node adentro (la imagen final pesa poco y no corre nada como root).
#
# Las versiones van fijas a propósito: Node la misma del .nvmrc y nginx una exacta; se suben a mano, no solas.

# ------------------------------------------------------------ 1) construir
FROM node:22.22.2-alpine AS build
WORKDIR /app
# pnpm sale de Corepack con la versión exacta de packageManager (package.json)
RUN corepack enable

# primero solo lo que decide las dependencias: si no cambia, Docker reusa la instalación y el build es rápido
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY examples/package.json examples/
RUN pnpm install --frozen-lockfile

COPY . .
# el paquete primero (los ejemplos lo leen de dist/, como cualquier proyecto que lo instala) y luego los ejemplos
RUN pnpm run build && pnpm --filter @stackcraftmx/calcita-examples run build

# ------------------------------------------------------------ 2) servir
FROM nginxinc/nginx-unprivileged:1.29.8-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/examples/dist /usr/share/nginx/html
EXPOSE 8080
