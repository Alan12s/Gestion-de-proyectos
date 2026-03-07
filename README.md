# 📊 Sistema de Gestión de Proyectos

Sistema web para gestionar proyectos de desarrollo, integrando GitHub, Jira y Trello en un solo lugar.

## 🎯 ¿Qué hace este proyecto?

Imagina tener todos tus proyectos de desarrollo en un solo dashboard:
- ✅ Ver todos tus proyectos en un solo lugar
- ✅ Login seguro con JWT
- ✅ Crear, editar y organizar proyectos
- 🔄 Próximamente: Ver commits de GitHub
- 🔄 Próximamente: Ver tareas de Jira
- 🔄 Próximamente: Ver tableros de Trello

## 🚀 Demo Rápido

```bash
# 1. Clonar el repositorio
git clone https://github.com/Alan12s/Gestion-de-proyectos.git
cd Gestion-de-proyectos

# 2. Levantar todo con Docker
docker-compose up -d

# 3. Abrir en el navegador
http://localhost
```

## 📦 Tecnologías

### Backend
- **NestJS** - Framework de Node.js moderno
- **TypeScript** - JavaScript con tipos
- **Prisma** - ORM para base de datos
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación segura

### Frontend
- **React 18** - Librería UI
- **Vite** - Build tool rápido
- **TypeScript** - Tipado estático
- **TailwindCSS** - Estilos utility-first
- **Zustand** - Manejo de estado

### Infraestructura
- **Docker** - Contenedores
- **Nginx** - API Gateway
- **Redis** - Caché

## 📁 Estructura del Proyecto

```
gestion-proyectos/
├── services/              # Microservicios backend
│   ├── auth-service/      # Login y autenticación
│   └── projects-service/  # CRUD de proyectos
│
├── frontend/              # Aplicación web React
│   ├── src/
│   │   ├── pages/        # Páginas (Login, Dashboard)
│   │   ├── components/   # Componentes reutilizables
│   │   └── api/          # Comunicación con backend
│   └── public/           # Archivos estáticos
│
├── scripts/              # Scripts de utilidad
├── docs/                 # Documentación adicional
└── docker-compose.yml    # Configuración de Docker
```

## 🛠️ Instalación

### Requisitos Previos
- Docker y Docker Compose
- Node.js 18+ (si corres sin Docker)
- Git

### Opción 1: Con Docker (Recomendado)

```bash
# 1. Clonar repositorio
git clone https://github.com/Alan12s/Gestion-de-proyectos.git
cd Gestion-de-proyectos

# 2. Copiar archivos de configuración
cp services/auth-service/.env.example services/auth-service/.env
cp services/projects-service/.env.example services/projects-service/.env
cp frontend/.env.example frontend/.env

# 3. Levantar servicios
docker-compose up -d

# 4. Verificar que todo está corriendo
docker-compose ps

# 5. Ver logs
docker-compose logs -f
```

### Opción 2: Sin Docker (Desarrollo)

```bash
# Terminal 1: Auth Service
cd services/auth-service
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev

# Terminal 2: Projects Service
cd services/projects-service
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev

# Terminal 3: Frontend
cd frontend
npm install
npm run dev
```

## 🌐 URLs

Después de levantar todo:

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost
- **Auth Service**: http://localhost:3001
- **Projects Service**: http://localhost:3002

## 📖 Uso

### 1. Registrarse

```
1. Ve a http://localhost:5173/register
2. Completa:
   - Email: tu@email.com
   - Password: (mínimo 8 caracteres)
   - Nombre: Tu Nombre
3. Click en "Registrarse"
```

### 2. Iniciar Sesión

```
1. Ve a http://localhost:5173/login
2. Ingresa tu email y password
3. Serás redirigido al dashboard
```

### 3. Gestionar Proyectos

```
En el dashboard puedes:
- Ver todos tus proyectos
- Crear nuevo proyecto (botón "+")
- Editar proyecto (click en tarjeta)
- Cambiar estado (Activo, Pausado, Completado)
- Eliminar proyecto
```

## 🔧 Scripts Útiles

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f auth-service

# Reiniciar un servicio
docker-compose restart auth-service

# Detener todo
docker-compose down

# Detener y eliminar volúmenes (cuidado: borra datos)
docker-compose down -v

# Reconstruir imágenes
docker-compose build

# Acceder a la base de datos
docker-compose exec postgres psql -U postgres -d projectmanager_auth
```

## 🗄️ Base de Datos

### Conexiones

```bash
# PostgreSQL
Host: localhost
Port: 5432
User: postgres
Password: password
Databases:
  - projectmanager_auth
  - projectmanager_projects

# Redis
Host: localhost
Port: 6379
```

### Prisma Studio (GUI para base de datos)

```bash
# Auth Service
cd services/auth-service
npx prisma studio

# Projects Service
cd services/projects-service
npx prisma studio
```

## 🔐 Seguridad

- ✅ Passwords hasheados con bcrypt
- ✅ Tokens JWT con expiración
- ✅ Refresh tokens para sesiones largas
- ✅ CORS configurado
- ✅ Validación de datos con class-validator
- ✅ Variables de entorno nunca en Git

## 📚 Documentación Adicional

- [Documentación Simple](./docs/DOCUMENTACION_SIMPLE.md) - Explicación para principiantes
- [Documentación Técnica](./docs/TECHNICAL_DOCUMENTATION.md) - Detalles técnicos completos
- [Arquitectura Mejorada](./docs/ENHANCED_ARCHITECTURE.md) - Integraciones futuras
- [Estrategia Git](./docs/GIT_STRATEGY.md) - Cómo trabajar con Git

## 🐛 Troubleshooting

### Puerto ya en uso

```bash
# Ver qué usa el puerto 3001
lsof -i :3001

# Matar el proceso
kill -9 <PID>
```

### Error de conexión a PostgreSQL

```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps postgres

# Ver logs
docker-compose logs postgres

# Reiniciar
docker-compose restart postgres
```

### Frontend no carga datos

1. Verifica que los servicios estén corriendo: `docker-compose ps`
2. Revisa la consola del navegador (F12)
3. Verifica que tienes tokens en localStorage
4. Revisa logs del backend: `docker-compose logs -f auth-service`

## 🚧 Roadmap

### Fase 1: MVP (Actual) ✅
- [x] Sistema de autenticación
- [x] CRUD de proyectos
- [x] Dashboard básico
- [x] Docker setup

### Fase 2: Integraciones
- [ ] Conectar con GitHub
- [ ] Ver commits y pull requests
- [ ] Conectar con Jira
- [ ] Ver sprints y tareas
- [ ] Conectar con Trello
- [ ] Ver tableros y cards

### Fase 3: Mejoras
- [ ] Búsqueda avanzada
- [ ] Filtros y ordenamiento
- [ ] Estadísticas de proyectos
- [ ] Notificaciones
- [ ] Tema oscuro

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/nueva-feature`
3. Commit: `git commit -m 'feat: agregar nueva feature'`
4. Push: `git push origin feature/nueva-feature`
5. Crea un Pull Request

### Convención de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formato, no afecta código
refactor: refactoring
test: agregar tests
chore: cambios en build, CI, etc.
```

## 📝 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles

## 👨‍💻 Autor

**Alan**
- GitHub: [@Alan12s](https://github.com/Alan12s)
- Proyecto: [Gestión de Proyectos](https://github.com/Alan12s/Gestion-de-proyectos)

---

**Estado del Proyecto**: 🟢 En desarrollo activo

**Versión**: 1.0.0 (MVP)

**Última actualización**: Marzo 2026
