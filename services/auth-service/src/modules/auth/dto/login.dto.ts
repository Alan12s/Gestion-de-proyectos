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
