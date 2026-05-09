import { IsString, IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCoordenadorDto {
  @ApiProperty({ example: 'Engenharia de Produção', description: 'Curso do coordenador', required: false })
  @IsOptional()
  @IsString()
  cooStrCurso?: string;

  @ApiProperty({ example: 7, description: 'Novo ID de usuário vinculado ao coordenador', required: false })
  @IsOptional()
  @IsInt()
  usuIntId?: number;
}
