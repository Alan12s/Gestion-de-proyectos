import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Servicio de usuarios
 * Maneja operaciones con usuarios
 */
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear un nuevo usuario
   */
  async create(email: string, password: string, name: string): Promise<User> {
    // Verificar si el email ya existe
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new ConflictException('Este email ya está registrado');
    }

    // Hashear password (convertir a texto sin sentido)
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario
    return this.prisma.user.create({
      data: { email, passwordHash, name },
    });
  }

  /**
   * Buscar usuario por ID
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id, deletedAt: null },
    });
  }

  /**
   * Buscar usuario por email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email, deletedAt: null },
    });
  }

  /**
   * Actualizar último login
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  /**
   * Validar password
   */
  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  /**
   * Limpiar datos sensibles del usuario
   */
  sanitizeUser(user: User) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}
