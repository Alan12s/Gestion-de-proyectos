import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import configuration from './config/configuration';

/**
 * Módulo principal de la aplicación
 * Importa todos los módulos necesarios
 */
@Module({
  imports: [
    // Configuración (variables de entorno)
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),

    // Base de datos
    DatabaseModule,

    // Módulos de funcionalidad
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
