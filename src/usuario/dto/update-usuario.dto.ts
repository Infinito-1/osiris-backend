import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString()
  usuStrNome?: string;

  @IsOptional()
  @IsEmail()
  usuStrEmail?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  usuStrSenha?: string;

  @IsOptional()
  @IsString()
  usuStrTelefone?: string;

  @IsOptional()
  @IsString()
  usuStrTipo?: 'Empreendedor' | 'Coordenador' | 'Grupo';
}
