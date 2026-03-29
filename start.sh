#!/bin/bash

# Script de inicio completo del sistema de Gestión de Proyectos
# Este script inicia todos los servicios necesarios

set -e  # Salir si hay errores

echo "========================================="
echo "  Sistema de Gestión de Proyectos"
echo "  Iniciando todos los servicios..."
echo "========================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Directorio base del proyecto
PROJECT_DIR="$HOME/Escritorio/gestion-proyectos"

# Verificar que estamos en el directorio correcto
if [ ! -d "$PROJECT_DIR" ]; then
    print_error "No se encuentra el directorio del proyecto: $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"
print_success "Directorio del proyecto: $PROJECT_DIR"
echo ""

# Paso 1: Verificar PostgreSQL
echo "========================================="
echo "1. Verificando PostgreSQL"
echo "========================================="

if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL no está instalado"
    exit 1
fi

# Verificar que PostgreSQL está corriendo
if ! PGPASSWORD="alan.44674217" psql -U postgres -h localhost -c "SELECT 1" &> /dev/null; then
    print_error "PostgreSQL no está corriendo o las credenciales son incorrectas"
    print_info "Intenta iniciar PostgreSQL: sudo systemctl start postgresql"
    exit 1
fi

print_success "PostgreSQL está corriendo"

# Verificar bases de datos
print_info "Verificando bases de datos..."

DATABASES=("projectmanager_auth" "projectmanager_integrations")

for DB in "${DATABASES[@]}"; do
    if PGPASSWORD="alan.44674217" psql -U postgres -h localhost -lqt | cut -d \| -f 1 | grep -qw "$DB"; then
        print_success "Base de datos '$DB' existe"
    else
        print_warning "Creando base de datos '$DB'..."
        PGPASSWORD="alan.44674217" psql -U postgres -h localhost -c "CREATE DATABASE $DB;" 2>/dev/null || true
        print_success "Base de datos '$DB' creada"
    fi
done

echo ""

# Paso 2: Iniciar Auth Service
echo "========================================="
echo "2. Iniciando Auth Service (Puerto 3001)"
echo "========================================="

cd "$PROJECT_DIR/services/auth-service"

# Verificar que existe package.json
if [ ! -f "package.json" ]; then
    print_error "No se encuentra package.json en auth-service"
    exit 1
fi

# Verificar si el puerto 3001 está en uso
if lsof -i:3001 &> /dev/null; then
    print_warning "Puerto 3001 ya está en uso. Matando proceso..."
    kill -9 $(lsof -t -i:3001) 2>/dev/null || true
    sleep 2
fi

# Verificar node_modules
if [ ! -d "node_modules" ]; then
    print_warning "Instalando dependencias de auth-service..."
    npm install > /dev/null 2>&1
    print_success "Dependencias instaladas"
fi

# Iniciar servicio en background
print_info "Iniciando Auth Service..."
nohup npm run start:dev > /tmp/auth-service.log 2>&1 &
AUTH_PID=$!
echo $AUTH_PID > /tmp/auth-service.pid

# Esperar a que inicie
sleep 5

if ps -p $AUTH_PID > /dev/null; then
    print_success "Auth Service iniciado (PID: $AUTH_PID)"
    print_info "Logs: tail -f /tmp/auth-service.log"
else
    print_error "Auth Service falló al iniciar. Ver logs: cat /tmp/auth-service.log"
    exit 1
fi

echo ""

# Paso 3: Iniciar Integrations Service
echo "========================================="
echo "3. Iniciando Integrations Service (Puerto 3003)"
echo "========================================="

cd "$PROJECT_DIR/services/integrations-service"

# Verificar si el puerto 3003 está en uso
if lsof -i:3003 &> /dev/null; then
    print_warning "Puerto 3003 ya está en uso. Matando proceso..."
    kill -9 $(lsof -t -i:3003) 2>/dev/null || true
    sleep 2
fi

# Verificar node_modules
if [ ! -d "node_modules" ]; then
    print_warning "Instalando dependencias de integrations-service..."
    npm install > /dev/null 2>&1
    print_success "Dependencias instaladas"
fi

# Iniciar servicio en background
print_info "Iniciando Integrations Service..."
nohup npm run start:dev > /tmp/integrations-service.log 2>&1 &
INTEGRATIONS_PID=$!
echo $INTEGRATIONS_PID > /tmp/integrations-service.pid

# Esperar a que inicie
sleep 5

if ps -p $INTEGRATIONS_PID > /dev/null; then
    print_success "Integrations Service iniciado (PID: $INTEGRATIONS_PID)"
    print_info "Logs: tail -f /tmp/integrations-service.log"
else
    print_error "Integrations Service falló al iniciar. Ver logs: cat /tmp/integrations-service.log"
    exit 1
fi

echo ""

# Paso 4: Iniciar Frontend
echo "========================================="
echo "4. Iniciando Frontend (Puerto 5173)"
echo "========================================="

cd "$PROJECT_DIR/frontend"

# Verificar si el puerto 5173 está en uso
if lsof -i:5173 &> /dev/null; then
    print_warning "Puerto 5173 ya está en uso. Matando proceso..."
    kill -9 $(lsof -t -i:5173) 2>/dev/null || true
    sleep 2
fi

# Verificar node_modules
if [ ! -d "node_modules" ]; then
    print_warning "Instalando dependencias del frontend..."
    npm install > /dev/null 2>&1
    print_success "Dependencias instaladas"
fi

# Iniciar frontend en background
print_info "Iniciando Frontend..."
nohup npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > /tmp/frontend.pid

# Esperar a que inicie
sleep 5

if ps -p $FRONTEND_PID > /dev/null; then
    print_success "Frontend iniciado (PID: $FRONTEND_PID)"
    print_info "Logs: tail -f /tmp/frontend.log"
else
    print_error "Frontend falló al iniciar. Ver logs: cat /tmp/frontend.log"
    exit 1
fi

echo ""

# Resumen final
echo "========================================="
echo "  SISTEMA INICIADO CORRECTAMENTE"
echo "========================================="
echo ""
print_success "Todos los servicios están corriendo:"
echo ""
echo "  Auth Service:"
echo "    URL: http://localhost:3001"
echo "    PID: $AUTH_PID"
echo "    Logs: tail -f /tmp/auth-service.log"
echo ""
echo "  Integrations Service:"
echo "    URL: http://localhost:3003"
echo "    PID: $INTEGRATIONS_PID"
echo "    Logs: tail -f /tmp/integrations-service.log"
echo ""
echo "  Frontend:"
echo "    URL: http://localhost:5173"
echo "    PID: $FRONTEND_PID"
echo "    Logs: tail -f /tmp/frontend.log"
echo ""
echo "========================================="
echo "  ACCEDE A LA APLICACIÓN"
echo "========================================="
echo ""
print_info "Abre tu navegador en: ${BLUE}http://localhost:5173${NC}"
echo ""
print_warning "Para detener todos los servicios, ejecuta:"
echo "  ./stop.sh"
echo ""
print_info "Para ver logs en tiempo real:"
echo "  tail -f /tmp/auth-service.log"
echo "  tail -f /tmp/integrations-service.log"
echo "  tail -f /tmp/frontend.log"
echo ""
