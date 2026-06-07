import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUsuarioDto {
  @ApiProperty({ example: 'Maria Silva', description: 'Nome completo do usuário', required: false })
  @IsOptional()
  @IsString()
  usuStrNome?: string;

  @ApiProperty({ example: 'maria@email.com', description: 'Email único para login', required: false })
  @IsOptional()
  @IsEmail()
  usuStrEmail?: string;

  @ApiProperty({ example: 'novaSenha123', description: 'Senha do usuário (mínimo 6 caracteres)', required: false })
  @IsOptional()
  @IsString()
  @MinLength(6)
  usuStrSenha?: string;

  @ApiProperty({ example: '(11) 99999-9999', description: 'Telefone do usuário', required: false })
  @IsOptional()
  @IsString()
  usuStrTelefone?: string;

  @ApiProperty({
    example: 'Admin',
    description: 'Tipo de usuário',
    required: false,
    enum: ['Empreendedor', 'Coordenador', 'Grupo', 'Admin']
  })
  @IsOptional()
  @IsString()
  @IsIn(['Empreendedor', 'Coordenador', 'Grupo', 'Admin']) // 🔥 correção importante
  usuStrTipo?: 'Empreendedor' | 'Coordenador' | 'Grupo' | 'Admin';
}