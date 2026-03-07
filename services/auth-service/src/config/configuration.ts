/**
 * Configuración de la aplicación
 * Lee las variables de entorno y las organiza
 */
export default () => ({
  // Puerto donde corre el servidor
  port: parseInt(process.env.PORT, 10) || 3001,
  
  // Entorno (development, production)
  nodeEnv: process.env.NODE_ENV || 'development',

  // Base de datos
  database: {
    url: process.env.DATABASE_URL,
  },

  // JWT (tokens de autenticación)
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-CAMBIAR-EN-PRODUCCION',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },

  // Redis (caché)
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },

  // CORS (permisos de origen)
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
});
