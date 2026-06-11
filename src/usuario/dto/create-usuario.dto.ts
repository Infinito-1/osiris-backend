import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsNumber,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({
    example: 'Maria Silva',
    description: 'Nome completo do usuário',
  })
  @IsString()
  usuStrNome!: string;

  @ApiProperty({
    example: 'maria@aluno.cps.sp.gov.br',
    description: 'Email único para login',
  })
  @IsEmail()
  usuStrEmail!: string;

  @ApiProperty({
    example: '123456',
    description: 'Senha do usuário (mínimo 6 caracteres)',
  })
  @IsString()
  @MinLength(6)
  usuStrSenha!: string;

  @ApiProperty({
    example: '(11) 99999-9999',
    description: 'Telefone do usuário',
    required: false,
  })
  @IsOptional()
  @IsString()
  usuStrTelefone?: string;

  @ApiProperty({
    example: 'Grupo',
    description: 'Tipo de usuário',
    enum: ['Empreendedor', 'Coordenador', 'Grupo'],
  })
  @IsString()
  @IsIn(['Empreendedor', 'Coordenador', 'Grupo', 'Admin'])
  usuStrTipo!: 'Empreendedor' | 'Coordenador' | 'Grupo' | 'Admin';

  // Coordenador
  @IsOptional()
  @IsString()
  cooStrCurso?: string;

  // Empreendedor
  @IsOptional()
  @IsString()
  empStrEmpresa?: string;

  @IsOptional()
  @IsString()
  empChaCnpj?: string;

  // Grupo
  @IsOptional()
  @IsString()
  gruStrNome?: string;

  @IsOptional()
  @IsString()
  gruStrDescricao?: string;

  @IsOptional()
  @IsString()
  gruChaRa?: string;

  @IsOptional()
  @IsNumber()
  gruIntTamanho?: number;

  @IsOptional()
  @IsString()
  gruStrMembros?: string;

  @IsOptional()
  @IsNumber()
  semIntId?: number;
}
