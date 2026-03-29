import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { randomUUID } from 'crypto';

/**
 * Servicio de autenticación
 * Maneja registro, login y tokens
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Registrar nuevo usuario
   */
  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    // Crear usuario
    const user = await this.usersService.create(email, password, name);

    // Generar tokens
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: this.usersService.sanitizeUser(user),
      ...tokens,
    };
  }

  /**
   * Login de usuario
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Buscar usuario
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email o password incorrectos');
    }

    // Validar password
    const isValid = await this.usersService.validatePassword(user, password);
    if (!isValid) {
      throw new UnauthorizedException('Email o password incorrectos');
    }

    // Actualizar último login
    await this.usersService.updateLastLogin(user.id);

    // Generar tokens
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: this.usersService.sanitizeUser(user),
      ...tokens,
    };
  }

  /**
   * Refrescar token
   */
  async refresh(refreshToken: string) {
    // Buscar refresh token
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored) {
      throw new UnauthorizedException('Token inválido');
    }

    if (stored.revokedAt) {
      throw new UnauthorizedException('Token revocado');
    }

    if (new Date() > stored.expiresAt) {
      throw new UnauthorizedException('Token expirado');
    }

    // Generar nuevos tokens
    const tokens = await this.generateTokens(stored.user.id, stored.user.email);

    // Revocar token anterior
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return tokens;
  }

  /**
   * Logout
   */
  async logout(refreshToken: string): Promise<void> {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (stored && !stored.revokedAt) {
      await this.prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date() },
      });
    }
  }

  /**
   * Validar token (para otros servicios)
   */
  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return {
        valid: true,
        userId: payload.sub,
        email: payload.email,
      };
    } catch (error) {
      return { valid: false };
    }
  }

  /**
   * Generar access token y refresh token
   */
  private async generateTokens(userId: string, email: string) {
    // Payload del JWT
    const payload = { sub: userId, email };

    // Access token (corta duración)
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('jwt.expiresIn'),
    });

    // Refresh token (larga duración)
    const refreshToken = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Guardar refresh token
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }
}
