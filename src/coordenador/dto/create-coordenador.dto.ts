import { IsString, IsNotEmpty, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCoordenadorDto {
  @ApiProperty({ example: 'Engenharia de Software', description: 'Curso do coordenador' })
  @IsNotEmpty()
  @IsString()
  cooStrCurso: string;

  @ApiProperty({ example: 5, description: 'ID do usuário vinculado ao coordenador' })
  @IsInt()
  usuIntId: number; // FK para Usuario
}
