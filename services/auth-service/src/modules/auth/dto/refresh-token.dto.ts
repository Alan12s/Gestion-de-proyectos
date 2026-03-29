import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO para refrescar token
 */
export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
