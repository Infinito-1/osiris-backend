import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGrupoDto {
  @ApiProperty({ example: 'Grupo Alpha', description: 'Nome do grupo acadêmico' })
  @IsNotEmpty()
  @IsString()
  gruStrNome: string;

  @ApiProperty({ example: 'Sistema de match de projetos', description: 'Descrição do escopo do grupo' })
  @IsNotEmpty()
  @IsString()
  gruStrDescricao: string;

  @ApiProperty({ example: 'Maria Soares', description: 'Nome completo do líder' })
  @IsNotEmpty()
  @IsString()
  gruStrLider: string;

  @ApiProperty({ example: '1234567890123', description: 'Código RA do líder do grupo' })
  @IsNotEmpty()
  @IsString()
  gruChaRa: string;

  @ApiProperty({ example: 5, description: 'Quantidade de integrantes do grupo' })
  @IsNotEmpty()
  @IsNumber()
  gruIntTamanho: number;

  @ApiProperty({ example: 'Pedro, Ana, Lucas', description: 'Integrantes do grupo', required: false })
  @IsOptional()
  @IsString()
  gruStrMembros?: string;

  @ApiProperty({ example: 10, description: 'ID do usuário base gerado na autenticação' })
  @IsNotEmpty()
  @IsNumber()
  usuIntId: number;
}