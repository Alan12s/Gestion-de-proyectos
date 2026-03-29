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
