# Scripts de Gestión del Sistema

He creado 3 scripts para gestionar todo el sistema fácilmente.

## Instalación de los scripts

Ejecuta estos comandos para copiar los scripts a tu proyecto:

```bash
cd ~/Escritorio/gestion-proyectos

# Descargar los scripts desde outputs
cp /mnt/user-data/outputs/start.sh ./start.sh
cp /mnt/user-data/outputs/stop.sh ./stop.sh
cp /mnt/user-data/outputs/status.sh ./status.sh

# Dar permisos de ejecución
chmod +x start.sh stop.sh status.sh
```

## Uso de los scripts

### 1. Iniciar TODO el sistema

```bash
cd ~/Escritorio/gestion-proyectos
./start.sh
```

**Este script hace:**
1. Verifica que PostgreSQL esté corriendo
2. Verifica/crea las bases de datos necesarias
3. Inicia Auth Service (puerto 3001)
4. Inicia Integrations Service (puerto 3003)
5. Inicia Frontend (puerto 5173)
6. Muestra resumen de todos los servicios

**Salida esperada:**
```
=========================================
  Sistema de Gestión de Proyectos
  Iniciando todos los servicios...
=========================================

✓ PostgreSQL está corriendo
✓ Base de datos 'projectmanager_auth' existe
✓ Base de datos 'projectmanager_integrations' existe

=========================================
2. Iniciando Auth Service (Puerto 3001)
=========================================
✓ Auth Service iniciado (PID: 12345)

=========================================
3. Iniciando Integrations Service (Puerto 3003)
=========================================
✓ Integrations Service iniciado (PID: 12346)

=========================================
4. Iniciando Frontend (Puerto 5173)
=========================================
✓ Frontend iniciado (PID: 12347)

=========================================
  SISTEMA INICIADO CORRECTAMENTE
=========================================

ℹ Abre tu navegador en: http://localhost:5173
```

### 2. Verificar estado del sistema

```bash
cd ~/Escritorio/gestion-proyectos
./status.sh
```

**Muestra:**
- Estado de PostgreSQL
- Estado de cada servicio (corriendo/detenido)
- PIDs de los procesos
- URLs de acceso
- Comandos para ver logs

**Salida esperada:**
```
=========================================
  Estado de los Servicios
=========================================

PostgreSQL: CORRIENDO
Auth Service (Puerto 3001): CORRIENDO (PID: 12345)
Integrations Service (Puerto 3003): CORRIENDO (PID: 12346)
Frontend (Puerto 5173): CORRIENDO (PID: 12347)

=========================================
  URLs de Acceso
=========================================

  Frontend:      http://localhost:5173
  Auth API:      http://localhost:3001/api/auth
  Integrations:  http://localhost:3003/api/integrations
```

### 3. Detener TODO el sistema

```bash
cd ~/Escritorio/gestion-proyectos
./stop.sh
```

**Este script:**
- Detiene Auth Service
- Detiene Integrations Service
- Detiene Frontend
- Libera todos los puertos (3001, 3003, 5173)

**Salida esperada:**
```
Deteniendo todos los servicios...
✓ Auth Service detenido
✓ Integrations Service detenido
✓ Frontend detenido

Verificando puertos...
Todos los servicios detenidos
```

## Ver logs en tiempo real

Cada servicio guarda sus logs en `/tmp/`:

```bash
# Ver logs de Auth Service
tail -f /tmp/auth-service.log

# Ver logs de Integrations Service
tail -f /tmp/integrations-service.log

# Ver logs de Frontend
tail -f /tmp/frontend.log

# Ver todos los logs a la vez
tail -f /tmp/auth-service.log /tmp/integrations-service.log /tmp/frontend.log
```

## Flujo de trabajo diario

### Iniciar el día

```bash
cd ~/Escritorio/gestion-proyectos
./start.sh
# Espera 10-15 segundos
# Abre http://localhost:5173
```

### Verificar que todo funciona

```bash
./status.sh
```

### Terminar el día

```bash
./stop.sh
```

## Solución de problemas

### "Puerto ya está en uso"

```bash
# Detener todo primero
./stop.sh

# Esperar 5 segundos
sleep 5

# Iniciar de nuevo
./start.sh
```

### "PostgreSQL no está corriendo"

```bash
# Iniciar PostgreSQL
sudo systemctl start postgresql

# O si usas Docker
docker start postgres-gestion

# Luego iniciar el sistema
./start.sh
```

### Ver errores específicos

```bash
# Ver últimas 50 líneas de un servicio
tail -n 50 /tmp/auth-service.log
tail -n 50 /tmp/integrations-service.log
tail -n 50 /tmp/frontend.log

# Buscar errores
grep -i error /tmp/auth-service.log
grep -i error /tmp/integrations-service.log
grep -i error /tmp/frontend.log
```

### Reiniciar un solo servicio

```bash
# Detener todo
./stop.sh

# Editar start.sh y comentar los servicios que no quieres iniciar
# O simplemente:

# Reiniciar solo Auth Service
cd ~/Escritorio/gestion-proyectos/services/auth-service
npm run start:dev

# Reiniciar solo Integrations Service
cd ~/Escritorio/gestion-proyectos/services/integrations-service
npm run start:dev

# Reiniciar solo Frontend
cd ~/Escritorio/gestion-proyectos/frontend
npm run dev
```

## Ubicación de archivos importantes

```
~/Escritorio/gestion-proyectos/
├── start.sh              ← Iniciar todo
├── stop.sh               ← Detener todo
├── status.sh             ← Ver estado
├── .credentials.md       ← Credenciales de GitHub (NO SUBIR A GIT)
└── services/
    ├── auth-service/
    │   └── .env          ← Variables de entorno Auth
    └── integrations-service/
        └── .env          ← Variables de entorno Integrations

/tmp/
├── auth-service.log      ← Logs Auth Service
├── integrations-service.log ← Logs Integrations
├── frontend.log          ← Logs Frontend
├── auth-service.pid      ← PID Auth Service
├── integrations-service.pid ← PID Integrations
└── frontend.pid          ← PID Frontend
```

## Comandos rápidos

```bash
# Iniciar
./start.sh

# Estado
./status.sh

# Detener
./stop.sh

# Logs en vivo
tail -f /tmp/*.log

# Reiniciar todo
./stop.sh && sleep 2 && ./start.sh
```

## Próximos pasos

Una vez que el sistema esté corriendo:

1. Abre http://localhost:5173
2. Registra tu cuenta
3. Inicia sesión
4. Click en "Conectar con GitHub"
5. Autoriza en GitHub
6. ¡Verás tus repositorios en tarjetas!
