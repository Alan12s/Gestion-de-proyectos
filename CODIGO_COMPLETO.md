# Código Completo del Proyecto - Guía de Implementación

Este archivo contiene todo el código que falta para completar el MVP básico.
Copia cada archivo a su ubicación correspondiente.

## AUTH SERVICE - Base de Datos

### services/auth-service/src/database/prisma.service.ts

```typescript
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
```

### services/auth-service/src/database/database.module.ts

```typescript
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Módulo de base de datos
 * Global para que esté disponible en toda la app
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
```

## AUTH SERVICE - DTOs

### services/auth-service/src/modules/auth/dto/register.dto.ts

```typescript
import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

/**
 * DTO para registro de usuario
 * Define qué datos se necesitan para registrarse
 */
export class RegisterDto {
  @IsEmail({}, { message: 'Email no válido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password debe tener mínimo 8 caracteres' })
  @MaxLength(100)
  @IsNotEmpty()
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @IsNotEmpty()
  name: string;
}
```

### services/auth-service/src/modules/auth/dto/login.dto.ts

```typescript
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO para login
 */
export class LoginDto {
  @IsEmail({}, { message: 'Email no válido' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
```

### services/auth-service/src/modules/auth/dto/refresh-token.dto.ts

```typescript
import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO para refrescar token
 */
export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
```

## AUTH SERVICE - Users Module

### services/auth-service/src/modules/users/users.service.ts

```typescript
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
```

### services/auth-service/src/modules/users/users.module.ts

```typescript
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

## AUTH SERVICE - Auth Module (CÓDIGO MÁS IMPORTANTE)

### services/auth-service/src/modules/auth/auth.service.ts

```typescript
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
```

### services/auth-service/src/modules/auth/auth.controller.ts

```typescript
import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

/**
 * Controlador de autenticación
 * Define las rutas (endpoints) disponibles
 */
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/register
   * Registrar nuevo usuario
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * POST /api/auth/login
   * Iniciar sesión
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * POST /api/auth/refresh
   * Refrescar access token
   */
  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto.refreshToken);
  }

  /**
   * POST /api/auth/logout
   * Cerrar sesión
   */
  @Post('logout')
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    await this.authService.logout(refreshTokenDto.refreshToken);
    return { message: 'Sesión cerrada correctamente' };
  }

  /**
   * GET /api/auth/me
   * Obtener usuario actual (requiere autenticación)
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return req.user;
  }

  /**
   * POST /api/auth/validate
   * Validar token (para otros servicios)
   */
  @Post('validate')
  async validateToken(@Body('token') token: string) {
    return this.authService.validateToken(token);
  }
}
```

### services/auth-service/src/modules/auth/strategies/jwt.strategy.ts

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

/**
 * Estrategia JWT
 * Valida tokens JWT
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret'),
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return this.usersService.sanitizeUser(user);
  }
}
```

### services/auth-service/src/common/guards/jwt-auth.guard.ts

```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard JWT
 * Protege rutas que requieren autenticación
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
```

### services/auth-service/src/modules/auth/auth.module.ts

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: {
          expiresIn: configService.get('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

## Continúa en el próximo archivo...

El resto del código (Projects Service, Frontend, Nginx) se creará después del primer commit.
Por ahora tenemos el Auth Service completo.
