import { IsNotEmpty, IsBoolean, IsInt, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatusCandidatura } from './status.enum';

export class CreateCandidaturaDto {
  @ApiProperty({ example: 'Pendente', description: 'Status da candidatura' })
  @IsNotEmpty()
  @IsEnum(StatusCandidatura)
  canStrStatus: StatusCandidatura;

  @ApiProperty({ example: false, description: 'Indica se a candidatura foi aprovada' })
  @IsBoolean()
  canBoolAprovacao: boolean;

  @ApiProperty({ example: 1, description: 'ID do coordenador vinculado' })
  @IsInt()
  cooIntId: number; // FK para Coordenador

  @ApiProperty({ example: 2, description: 'ID da demanda vinculada' })
  @IsInt()
  demIntId: number; // FK para Demanda

  @ApiProperty({ example: 3, description: 'ID do grupo vinculado' })
  @IsInt()
  gruIntId: number; // FK para Grupo
}
