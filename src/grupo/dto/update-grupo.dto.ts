import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGrupoDto {
  @ApiProperty({ example: 'Grupo Beta', description: 'Nome do grupo', required: false })
  @IsOptional()
  @IsString()
  gruStrNome?: string;

  @ApiProperty({ example: 'Grupo focado em IA', description: 'Descrição do grupo', required: false })
  @IsOptional()
  @IsString()
  gruStrDescricao?: string;

  @ApiProperty({ example: 'Carlos Souza', description: 'Nome do líder do grupo', required: false })
  @IsOptional()
  @IsString()
  gruIntLider?: string;

  @ApiProperty({ example: 'RA987654', description: 'Código RA do líder', required: false })
  @IsOptional()
  @IsString()
  gruChaRa?: string;

  @ApiProperty({ example: 6, description: 'Tamanho do grupo', required: false })
  @IsOptional()
  @IsNumber()
  gruIntTamanho?: number;

  @ApiProperty({ example: 'Lucas, Fernanda', description: 'Lista de membros do grupo', required: false })
  @IsOptional()
  @IsString()
  gruStrMembros?: string;

  @ApiProperty({ example: 'https://github.com/grupo-alpha', description: 'Link do portfólio do grupo', required: false })
  @IsOptional()
  @IsString()
  gruStrPortfolio?: string;

  @ApiProperty({ example: false, description: 'Define se o grupo está ativo (suspensão)', required: false })
  @IsOptional()
  @IsBoolean()
  gruBoolAtivo?: boolean;

  @ApiProperty({ example: 12, description: 'Novo ID de usuário vinculado ao grupo', required: false })
  @IsOptional()
  usuIntId?: number;
}
