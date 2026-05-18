import { IsNotEmpty, IsBoolean, IsInt, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatusCandidatura } from './status.enum';

export class CreateCandidaturaDto {
  @ApiProperty({ example: 'Pendente', description: 'Status inicial da candidatura' })
  @IsNotEmpty()
  @IsEnum(StatusCandidatura)
  canStrStatus: StatusCandidatura;

  @ApiProperty({ example: false, description: 'Indica se a candidatura foi aprovada' })
  @IsBoolean()
  canBoolAprovacao: boolean;

  @ApiProperty({ example: 1, description: 'ID do coordenador (opcional no início)', required: false })
  @IsOptional()
  @IsInt()
  cooIntId?: number;

  @ApiProperty({ example: 2, description: 'ID da demanda vinculada' })
  @IsInt()
  demIntId: number;

  @ApiProperty({ example: 3, description: 'ID do grupo estudante vinculado' })
  @IsInt()
  gruIntId: number;
}