import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'Maria Silva', description: 'Nome completo do usuário' })
  @IsString()
  usuStrNome: string;

  @ApiProperty({ example: 'maria@email.com', description: 'Email único para login' })
  @IsEmail()
  usuStrEmail: string;

  @ApiProperty({ example: '123456', description: 'Senha do usuário (mínimo 6 caracteres)' })
  @IsString()
  @MinLength(6)
  usuStrSenha: string;

  @ApiProperty({ example: '(11) 99999-9999', description: 'Telefone do usuário', required: false })
  @IsOptional()
  @IsString()
  usuStrTelefone?: string;

  @ApiProperty({ example: 'Empreendedor', description: 'Tipo de usuário' })
  @IsString()
  usuStrTipo: 'Empreendedor' | 'Coordenador' | 'Grupo';
}
