-- Script de inicialización de bases de datos
-- Crea bases de datos separadas para cada servicio

-- Crear base de datos para Auth Service
CREATE DATABASE projectmanager_auth;

-- Crear base de datos para Projects Service
CREATE DATABASE projectmanager_projects;

-- Conectar a la base de datos de auth
\c projectmanager_auth;

-- Habilitar extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Conectar a la base de datos de projects
\c projectmanager_projects;

-- Habilitar extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Mensaje de confirmación
SELECT 'Bases de datos inicializadas correctamente' AS status;
