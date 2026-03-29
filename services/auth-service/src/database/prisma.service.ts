import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Servicio de Prisma
 * Maneja la conexión con la base de datos
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  // Conectar cuando el módulo inicia
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Base de datos conectada');
  }

  // Desconectar cuando el módulo termina
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Base de datos desconectada');
  }
}
