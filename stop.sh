#!/bin/bash

# Script para detener todos los servicios

echo "Deteniendo todos los servicios..."

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Función para detener un servicio
stop_service() {
    local NAME=$1
    local PID_FILE=$2
    
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            kill $PID 2>/dev/null
            sleep 2
            if ps -p $PID > /dev/null 2>&1; then
                kill -9 $PID 2>/dev/null
            fi
            echo -e "${GREEN}✓ $NAME detenido${NC}"
        else
            echo -e "${RED}✗ $NAME no estaba corriendo${NC}"
        fi
        rm -f "$PID_FILE"
    else
        echo -e "${RED}✗ No se encontró PID de $NAME${NC}"
    fi
}

# Detener servicios
stop_service "Auth Service" "/tmp/auth-service.pid"
stop_service "Integrations Service" "/tmp/integrations-service.pid"
stop_service "Frontend" "/tmp/frontend.pid"

# Matar cualquier proceso remanente en los puertos
echo ""
echo "Verificando puertos..."

for PORT in 3001 3003 5173; do
    if lsof -i:$PORT &> /dev/null; then
        echo "Matando proceso en puerto $PORT..."
        kill -9 $(lsof -t -i:$PORT) 2>/dev/null || true
    fi
done

echo ""
echo -e "${GREEN}Todos los servicios detenidos${NC}"
