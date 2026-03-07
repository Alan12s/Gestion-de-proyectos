import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Función principal que inicia el servidor
 */
async function bootstrap() {
  // Crear la aplicación
  const app = await NestFactory.create(AppModule);

  // Permitir peticiones desde otros dominios (CORS)
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Validar automáticamente los datos que llegan
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Puerto del servidor
  const port = process.env.PORT || 3001;

  // Iniciar servidor
  await app.listen(port);
  
  console.log(`🚀 Auth Service corriendo en puerto ${port}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
