#!/usr/bin/env bash
# ============================================================
#  Túnel de Cloudflare que publica los ejemplos (para enseñarlos por internet sin subir nada a un servidor).
#  Uso: bash scripts/tunnel.sh start|stop|status   (o pnpm run tunnel:start, tunnel:stop, tunnel:status)
#
#  El token vive en tunnel/.cloudflared.token (una línea, fuera de git: /tunnel/ está en el .gitignore). La dirección
#  pública y hacia dónde apunta (p. ej. http://localhost:8095) se configuran en el panel de Cloudflare, no aquí; el script
#  las lee del log de cloudflared al arrancar.
#
#  Lo que se publica son los ejemplos de la imagen de Docker: docker compose up -d examples (README, «Probar sin instalar
#  nada»). El puerto de compose (EXAMPLES_PORT) tiene que ser el mismo al que apunta el túnel en el panel.
#
#  Por qué con --token-file y no --token: con --token el secreto queda a la vista de cualquiera que liste procesos (ps).
#  Con --token-file solo se ve la ruta del archivo.
#
#  IMPORTANTE: en la máquina puede correr el cloudflared de otro proyecto. stop solo mata el pid de tunnel/tunnel.pid, y
#  solo si ese proceso es de verdad nuestro cloudflared (ver is_our_tunnel_running).
# ============================================================
set -euo pipefail

ROOT_DIRECTORY="$(cd "$(dirname "$0")/.." && pwd)"
TUNNEL_DIRECTORY="$ROOT_DIRECTORY/tunnel"
TOKEN_FILE="$TUNNEL_DIRECTORY/.cloudflared.token"
PID_FILE="$TUNNEL_DIRECTORY/tunnel.pid"
LOG_FILE="$TUNNEL_DIRECTORY/tunnel.log"
# cuánto se espera a que Cloudflare acepte el túnel (segundos)
REGISTER_WAIT_SECONDS=20

# ------------------------------------------------------------ funciones
# ¿El pid del archivo vive Y es nuestro cloudflared?
# OJO: no basta con que el pid viva. Tras reiniciar la máquina el número se recicla y podría ser otro proceso (o el
# cloudflared de otro proyecto); por eso se compara la línea de comando con NUESTRO archivo de token.
is_our_tunnel_running() {
    [ -s "$PID_FILE" ] || return 1
    local tunnel_pid process_command
    tunnel_pid="$(tr -d '[:space:]' < "$PID_FILE")"
    # NOTA: primero a una variable y luego grep; con "ps | grep -q" y pipefail, un SIGPIPE daría un falso "no corre"
    process_command="$(ps -p "$tunnel_pid" -o command= 2>/dev/null || true)"
    grep -qF -- "--token-file $TOKEN_FILE" <<< "$process_command"
}

# Código HTTP de una URL (000 si no contesta).
http_status_of() {
    curl -s -o /dev/null -m 10 -w '%{http_code}' "$1" || true
}

# La dirección pública y el servicio local que el panel de Cloudflare le dio al túnel, leídos de la ÚLTIMA configuración
# del log (cloudflared escribe otra cada vez que se cambia en el panel). Vacío si todavía no llega.
# OJO: en el log la configuración viene como JSON dentro de una cadena, con las comillas escapadas (\"hostname\"); y el
# primer «service» es el del dominio: el último es la regla de «todo lo demás» (http_status:404)
ingress_value_of() {
    { grep "Updated to new configuration" "$LOG_FILE" 2>/dev/null || true; } | tail -1 \
        | { grep -o "\\\\\"$1\\\\\":\\\\\"[^\\\\]*" || true; } | head -1 | sed -E 's/.*:\\"//'
}

print_addresses() {
    local public_host local_service
    public_host="$(ingress_value_of hostname)"
    local_service="$(ingress_value_of service)"
    if [ -n "$public_host" ]; then
        echo "  dirección pública  https://$public_host  responde HTTP $(http_status_of "https://$public_host")"
    fi
    if [ -n "$local_service" ]; then
        echo "  apunta a           $local_service  responde HTTP $(http_status_of "$local_service")"
    fi
}

# ------------------------------------------------------------ comandos
command_name="${1:-status}"

case "$command_name" in
    start)
        if [ ! -s "$TOKEN_FILE" ]; then
            echo "Falta el token en tunnel/.cloudflared.token (una línea: el token del túnel en el panel de Cloudflare)."
            exit 1
        fi
        # IMPORTANTE: --token-file esconde el secreto de ps, pero no sirve si el archivo lo lee cualquier usuario de la
        # máquina (cp y los editores lo dejan 644). Solo lo lee cloudflared, que corre con nuestro usuario: 600 siempre
        chmod 600 "$TOKEN_FILE"
        if is_our_tunnel_running; then
            echo "El túnel ya está corriendo (pid $(cat "$PID_FILE")). Para reiniciarlo: tunnel:stop y luego tunnel:start."
            exit 1
        fi
        # el log anterior se guarda con su hora: si el túnel se cayó, ahí está el porqué
        if [ -s "$LOG_FILE" ]; then
            mv "$LOG_FILE" "$TUNNEL_DIRECTORY/tunnel-$(TZ=America/Mexico_City date +%Y-%m-%d-%H%M%S).log"
        fi
        # nohup para que sobreviva a cerrar la terminal; stdin de /dev/null para que no se quede esperando teclado.
        # --protocol http2: por omisión cloudflared usa QUIC (UDP), que con conexiones inestables se reconecta sin parar;
        # HTTP/2 va por TCP y aguanta mejor los cortes cortos
        nohup cloudflared tunnel --protocol http2 run --token-file "$TOKEN_FILE" > "$LOG_FILE" 2>&1 < /dev/null &
        echo $! > "$PID_FILE"

        connection_registered=false
        for attempt in $(seq 1 "$REGISTER_WAIT_SECONDS"); do
            if ! is_our_tunnel_running; then
                echo "El túnel murió al arrancar. Últimas líneas de tunnel/tunnel.log:"
                tail -5 "$LOG_FILE"
                rm -f "$PID_FILE"
                exit 1
            fi
            if grep -q "Registered tunnel connection" "$LOG_FILE"; then
                connection_registered=true
                break
            fi
            sleep 1
        done
        echo "Túnel iniciado (pid $(cat "$PID_FILE")). Log: tunnel/tunnel.log"
        # el proceso vive pero Cloudflare no lo ha aceptado: suele ser el token o la red. No se mata: puede tardar
        if [ "$connection_registered" = "false" ]; then
            echo "  OJO: en $REGISTER_WAIT_SECONDS s Cloudflare no registró ninguna conexión. Revise tunnel/tunnel.log y tunnel:status."
        fi
        print_addresses
        ;;

    stop)
        if [ ! -s "$PID_FILE" ]; then
            echo "No hay tunnel/tunnel.pid: el túnel no está corriendo. No se mató nada."
            exit 0
        fi
        if ! is_our_tunnel_running; then
            # el pid ya no es nuestro cloudflared: el archivo quedó viejo y se quita, sin matar a nadie
            echo "El pid $(cat "$PID_FILE") ya no es el túnel de los ejemplos. Se borra el tunnel.pid viejo; no se mató nada."
            rm -f "$PID_FILE"
            exit 0
        fi
        tunnel_pid="$(tr -d '[:space:]' < "$PID_FILE")"
        kill -TERM "$tunnel_pid"
        echo "Apagando el túnel (pid $tunnel_pid)..."
        # cloudflared cierra con calma las conexiones abiertas (hasta 30 s); se le espera un poco más
        for attempt in $(seq 1 35); do
            if ! kill -0 "$tunnel_pid" 2>/dev/null; then
                rm -f "$PID_FILE"
                echo "Túnel apagado."
                exit 0
            fi
            sleep 1
        done
        echo "OJO: el túnel sigue vivo después de 35 s (pid $tunnel_pid). Revise tunnel/tunnel.log antes de forzarlo."
        exit 1
        ;;

    status)
        if is_our_tunnel_running; then
            tunnel_pid="$(tr -d '[:space:]' < "$PID_FILE")"
            echo "TÚNEL CORRIENDO (pid $tunnel_pid, lleva $(ps -p "$tunnel_pid" -o etime= | tr -d ' '))"
            echo "  conexiones registradas desde que arrancó: $({ grep -c "Registered tunnel connection" "$LOG_FILE" 2>/dev/null || true; })"
        else
            echo "TÚNEL DETENIDO (según tunnel/tunnel.pid)"
        fi
        print_addresses
        ;;

    *)
        echo "Uso: bash scripts/tunnel.sh start|stop|status"
        exit 1
        ;;
esac
