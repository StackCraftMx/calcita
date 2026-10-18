# Los ejemplos de Calcita en una imagen: para probarlos sin instalar Node ni pnpm (README, «Probar sin instalar nada»).
#
#   docker compose up -d examples      →  http://localhost:8095/demo/
#
# Se sirve DETRÁS DE UN PREFIJO (/demo), como un servidor con reverse proxy sin subdominio: así la demo pública prueba que
# Calcita funciona ahí. El prefijo es UNA variable, ASSET_URL: con ella se construyen los ejemplos y nginx la usa al arrancar
# (docker/nginx.conf.template). La raíz redirige a /demo/.
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
# el prefijo detrás del proxy (ver arriba); se cambia con: docker compose build --build-arg ASSET_URL=/otro
ARG ASSET_URL=/demo
# el paquete primero (los ejemplos lo leen de dist/, como cualquier proyecto que lo instala) y luego los ejemplos con el prefijo
RUN pnpm run build && ASSET_URL=$ASSET_URL pnpm --filter @stackcraftmx/calcita-examples run build

# ------------------------------------------------------------ 2) servir
FROM nginxinc/nginx-unprivileged:1.29.8-alpine
ARG ASSET_URL=/demo
# nginx llena ${ASSET_URL} de la plantilla al arrancar (envsubst de la imagen oficial)
ENV ASSET_URL=$ASSET_URL
COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
# los archivos viven bajo el prefijo, igual que en el servidor: /usr/share/nginx/html/demo/index.html
COPY --from=build /app/examples/dist /usr/share/nginx/html$ASSET_URL
EXPOSE 8080
