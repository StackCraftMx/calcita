# Atajos para enseñar los ejemplos de Calcita: la demo en Docker (http://localhost:8095/demo/) y el túnel de Cloudflare
# que la publica en internet. Solo llaman a lo que ya existe, compose.yaml y scripts/tunnel.sh; el porqué de cada paso
# está en esos dos archivos.
#
#   make up        prende la demo y el túnel
#   make down      apaga el túnel y la demo
#   make status    dice si corren y si contestan
#   make rebuild   vuelve a armar la demo con el código de hoy (tarda unos minutos y junta caché de Docker)
#
# OJO: el túnel apunta a http://localhost:8095 (eso se configura en el panel de Cloudflare, no aquí). Si la demo se
# levanta en otro puerto con EXAMPLES_PORT, la dirección pública queda prendida pero sin nada que contestar.

.PHONY: help up down status rebuild demo-up demo-down tunnel-up tunnel-down tunnel-status

help:
	@echo "make up        prende la demo (Docker, puerto 8095) y el túnel"
	@echo "make down      apaga el túnel y la demo"
	@echo "make status    dice si la demo y el túnel corren y si contestan"
	@echo "make rebuild   vuelve a armar la demo con el código de hoy"
	@echo ""
	@echo "Por separado: demo-up, demo-down, tunnel-up, tunnel-down, tunnel-status"

# primero la demo: si el túnel arranca antes, la dirección pública contesta con error mientras Docker termina
up: demo-up tunnel-up

# al revés que up: primero se corta el acceso de afuera y luego se apaga la demo
down: tunnel-down demo-down

status: tunnel-status
	@docker compose ps examples

# sin --build: si la imagen ya existe la usa tal cual (rápido y sin caché nueva)
demo-up:
	docker compose up -d examples

demo-down:
	docker compose down

# con --build: lo de hoy entra a la imagen; cada vez junta caché de construcción que luego hay que borrar
rebuild:
	docker compose up -d --build examples

tunnel-up:
	bash scripts/tunnel.sh start

tunnel-down:
	bash scripts/tunnel.sh stop

tunnel-status:
	bash scripts/tunnel.sh status
