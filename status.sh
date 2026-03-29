#!/bin/bash

# Script para verificar el estado de todos los servicios

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "========================================="
echo "  Estado de los Servicios"
echo "========================================="
echo ""

# Función para verificar servicio
check_service() {
    local NAME=$1
    local PORT=$2
    local PID_FILE=$3
    
    echo -n "$NAME (Puerto $PORT): "
    
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            if lsof -i:$PORT &> /dev/null; then
                echo -e "${GREEN}CORRIENDO${NC} (PID: $PID)"
                return 0
            else
                echo -e "${YELLOW}PROCESO ACTIVO PERO PUERTO NO ESCUCHANDO${NC}"
                return 1
            fi
        else
            echo -e "${RED}DETENIDO${NC} (proceso no encontrado)"
            return 1
        fi
    else
        if lsof -i:$PORT &> /dev/null; then
            PID=$(lsof -t -i:$PORT)
            echo -e "${YELLOW}CORRIENDO${NC} (PID: $PID, pero no gestionado por script)"
            return 0
        else
            echo -e "${RED}DETENIDO${NC}"
            return 1
        fi
    fi
}

# Verificar PostgreSQL
echo -n "PostgreSQL: "
if PGPASSWORD="alan.44674217" psql -U postgres -h localhost -c "SELECT 1" &> /dev/null 2>&1; then
    echo -e "${GREEN}CORRIENDO${NC}"
else
    echo -e "${RED}DETENIDO O NO ACCESIBLE${NC}"
fi

echo ""

# Verificar servicios
check_service "Auth Service" 3001 "/tmp/auth-service.pid"
check_service "Integrations Service" 3003 "/tmp/integrations-service.pid"
check_service "Frontend" 5173 "/tmp/frontend.pid"

echo ""
echo "========================================="
echo "  URLs de Acceso"
echo "========================================="
echo ""
echo "  Frontend:      http://localhost:5173"
echo "  Auth API:      http://localhost:3001/api/auth"
echo "  Integrations:  http://localhost:3003/api/integrations"
echo ""
echo "========================================="
echo "  Logs"
echo "========================================="
echo ""
echo "  Auth Service:        tail -f /tmp/auth-service.log"
echo "  Integrations:        tail -f /tmp/integrations-service.log"
echo "  Frontend:            tail -f /tmp/frontend.log"
echo ""
