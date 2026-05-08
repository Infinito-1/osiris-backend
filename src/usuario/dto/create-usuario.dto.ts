import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  usuStrNome: string;

  @IsEmail()
  usuStrEmail: string;

  @IsString()
  @MinLength(6)
  usuStrSenha: string;

  @IsOptional()
  @IsString()
  usuStrTelefone?: string;

  @IsString()
  usuStrTipo: 'Empreendedor' | 'Coordenador' | 'Grupo';
}
