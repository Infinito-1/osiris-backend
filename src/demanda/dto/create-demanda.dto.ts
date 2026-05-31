import { IsNotEmpty, IsString, IsBoolean, IsInt, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDemandaDto {
  @ApiProperty({ example: 'Sistema de Gestão', description: 'Nome da demanda' })
  @IsNotEmpty()
  @IsString()
  demStrNome: string;

  @ApiProperty({ example: 'Aplicação web para controle de estoque', description: 'Descrição detalhada da demanda' })
  @IsNotEmpty()
  @IsString()
  demStrDescricao: string;

  @ApiProperty({ example: true, description: 'Aceita mudança de tipo de demanda' })
  @IsBoolean()
  demBoolAceitaMudancaTipo: boolean;

  @ApiProperty({ example: false, description: 'Aceitação da demanda' })
  @IsBoolean()
  demBoolAceitacao: boolean;

  @ApiProperty({ example: false, description: 'Autoriza exibição do contato do empreendedor para grupos', required: false })
  @IsOptional()
  @IsBoolean()
  demBoolExibirContato?: boolean;

  @ApiProperty({ example: 1, description: 'ID do semestre vinculado' })
  @IsInt()
  semIntId: number;

  @ApiProperty({ example: 2, description: 'ID do empreendedor vinculado' })
  @IsInt()
  empIntId: number;

  @ApiProperty({ example: 3, description: 'ID do coordenador vinculado' })
  @IsInt()
  cooIntId: number;

  @ApiProperty({ example: [1, 2], description: 'IDs dos tipos de demanda vinculados', required: false })
  @IsOptional()
  @IsArray()
  tipIntIds?: number[];

  @ApiProperty({ example: ['Sistema Web', 'Novo Tipo'], description: 'Nomes dos tipos de demanda vinculados', required: false })
  @IsOptional()
  @IsArray()
  tipStrNomes?: string[];
}
