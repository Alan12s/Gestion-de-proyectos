# 🚀 Guía Rápida - Subir a GitHub y Completar el Proyecto

## ✅ Lo que ya está hecho

1. ✅ Estructura completa del proyecto creada
2. ✅ Git inicializado
3. ✅ .gitignore configurado (no subirá archivos sensibles)
4. ✅ README completo
5. ✅ Docker Compose listo
6. ✅ Auth Service con estructura base
7. ✅ Primer commit realizado

## 📤 Paso 1: Subir a GitHub

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
# Ver que todo está bien
git status

# Subir a GitHub
git push -u origin main
```

Si te pide usuario y contraseña:
- **Usuario**: Alan12s
- **Password**: Usa un Personal Access Token de GitHub (no tu password normal)

### Crear Personal Access Token en GitHub:

1. Ve a: https://github.com/settings/tokens
2. Click en "Generate new token" → "Classic"
3. Dale un nombre: "gestion-proyectos"
4. Selecciona permisos: `repo` (todos)
5. Click "Generate token"
6. Copia el token (se ve solo una vez)
7. Úsalo como password cuando Git te lo pida

## 📝 Paso 2: Completar el código

El archivo `CODIGO_COMPLETO.md` tiene TODO el código que falta.

### Archivos que debes crear (copiar y pegar del CODIGO_COMPLETO.md):

**Auth Service:**
```
services/auth-service/src/
├── database/
│   ├── prisma.service.ts         ← Copiar código
│   └── database.module.ts        ← Copiar código
├── modules/
│   ├── users/
│   │   ├── users.service.ts      ← Copiar código
│   │   └── users.module.ts       ← Copiar código
│   └── auth/
│       ├── dto/
│       │   ├── register.dto.ts   ← Copiar código
│       │   ├── login.dto.ts      ← Copiar código
│       │   └── refresh-token.dto.ts ← Copiar código
│       ├── strategies/
│       │   └── jwt.strategy.ts   ← Copiar código
│       ├── auth.service.ts       ← Copiar código
│       ├── auth.controller.ts    ← Copiar código
│       └── auth.module.ts        ← Copiar código
└── common/
    └── guards/
        └── jwt-auth.guard.ts     ← Copiar código
```

### Orden de copia (del CODIGO_COMPLETO.md):

1. `database/prisma.service.ts`
2. `database/database.module.ts`
3. `modules/auth/dto/register.dto.ts`
4. `modules/auth/dto/login.dto.ts`
5. `modules/auth/dto/refresh-token.dto.ts`
6. `modules/users/users.service.ts`
7. `modules/users/users.module.ts`
8. `modules/auth/auth.service.ts`
9. `modules/auth/auth.controller.ts`
10. `modules/auth/strategies/jwt.strategy.ts`
11. `common/guards/jwt-auth.guard.ts`
12. `modules/auth/auth.module.ts`

## 🔧 Paso 3: Instalar dependencias

```bash
cd services/auth-service
npm install
```

Esto instalará todas las librerías necesarias (puede tardar 2-3 minutos).

## 🗄️ Paso 4: Configurar base de datos

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Generar cliente de Prisma
npx prisma generate

# Crear las tablas en la base de datos
npx prisma migrate dev --name init
```

## ▶️ Paso 5: Probar que funciona

### Opción A: Con Docker (recomendado)

```bash
# Volver a la raíz del proyecto
cd ../..

# Levantar todo
docker-compose up -d

# Ver logs
docker-compose logs -f auth-service
```

### Opción B: Sin Docker

```bash
# En una terminal: PostgreSQL
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:15

# En otra terminal: Auth Service
cd services/auth-service
npm run start:dev
```

## 🧪 Paso 6: Probar el API

Abre Postman, Insomnia o usa curl:

### Registrar usuario:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alan@test.com",
    "password": "password123",
    "name": "Alan"
  }'
```

Deberías recibir algo como:

```json
{
  "user": {
    "id": "uuid-aqui",
    "email": "alan@test.com",
    "name": "Alan"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "uuid-aqui"
}
```

### Login:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alan@test.com",
    "password": "password123"
  }'
```

## 📝 Paso 7: Segundo commit

Después de copiar todos los archivos:

```bash
git add .
git commit -m "feat(auth): implementar autenticación completa

- DTOs para registro, login y refresh token
- Service de usuarios con bcrypt
- Service de auth con JWT
- Estrategia JWT de Passport
- Guards para proteger rutas
- Endpoints completos de autenticación
"
git push
```

## 🎯 Próximos pasos

Después de esto, el siguiente commit será:

1. **Projects Service** - CRUD de proyectos
2. **Frontend** - Login, registro y dashboard
3. **Nginx** - API Gateway

---

## ❓ Problemas comunes

### "Error: Cannot find module"
```bash
npm install
```

### "Port 3001 already in use"
```bash
lsof -i :3001
kill -9 <PID>
```

### "Prisma Client not generated"
```bash
npx prisma generate
```

### "Database doesn't exist"
```bash
# Conectar a postgres
psql -U postgres -h localhost

# Crear base de datos
CREATE DATABASE projectmanager_auth;

# Salir
\q

# Correr migraciones
npx prisma migrate dev
```

---

## 📞 ¿Necesitas ayuda?

El archivo `CODIGO_COMPLETO.md` tiene todos los archivos con código completo.
Solo copia y pega cada uno en su ubicación.

**Recuerda**: 
- NO subas archivos .env a Git (ya está en .gitignore)
- Usa tokens de GitHub, no tu password
- Copia los archivos exactamente como están
