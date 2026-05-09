import { IsOptional, IsBoolean, IsInt, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatusCandidatura } from './status.enum';

export class UpdateCandidaturaDto {
  @ApiProperty({ example: 'Aceita', description: 'Novo status da candidatura', required: false })
  @IsOptional()
  @IsEnum(StatusCandidatura)
  canStrStatus?: StatusCandidatura;

  @ApiProperty({ example: true, description: 'Atualiza aprovação da candidatura', required: false })
  @IsOptional()
  @IsBoolean()
  canBoolAprovacao?: boolean;

  @ApiProperty({ example: 1, description: 'Novo ID do coordenador vinculado', required: false })
  @IsOptional()
  @IsInt()
  cooIntId?: number;

  @ApiProperty({ example: 2, description: 'Novo ID da demanda vinculada', required: false })
  @IsOptional()
  @IsInt()
  demIntId?: number;

  @ApiProperty({ example: 3, description: 'Novo ID do grupo vinculado', required: false })
  @IsOptional()
  @IsInt()
  gruIntId?: number;
}
