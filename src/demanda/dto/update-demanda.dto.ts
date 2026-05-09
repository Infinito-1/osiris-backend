import { IsOptional, IsString, IsBoolean, IsInt, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDemandaDto {
  @ApiProperty({ example: 'Sistema de Controle', description: 'Nome da demanda', required: false })
  @IsOptional()
  @IsString()
  demStrNome?: string;

  @ApiProperty({ example: 'Sistema para controle de produção', description: 'Descrição detalhada da demanda', required: false })
  @IsOptional()
  @IsString()
  demStrDescricao?: string;

  @ApiProperty({ example: true, description: 'Aceita mudança de tipo de demanda', required: false })
  @IsOptional()
  @IsBoolean()
  demBoolAceitaMudancaTipo?: boolean;

  @ApiProperty({ example: true, description: 'Aceitação da demanda', required: false })
  @IsOptional()
  @IsBoolean()
  demBoolAceitacao?: boolean;

  @ApiProperty({ example: 1, description: 'ID do semestre vinculado', required: false })
  @IsOptional()
  @IsInt()
  semIntId?: number;

  @ApiProperty({ example: 2, description: 'ID do empreendedor vinculado', required: false })
  @IsOptional()
  @IsInt()
  empIntId?: number;

  @ApiProperty({ example: 3, description: 'ID do coordenador vinculado', required: false })
  @IsOptional()
  @IsInt()
  cooIntId?: number;

  @ApiProperty({ example: [1, 2], description: 'IDs dos tipos de demanda vinculados', required: false })
  @IsOptional()
  @IsArray()
  tipIntIds?: number[];
}
