import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ClassificarDemandaDto {
  @ApiProperty({ example: '2026/1', description: 'Semestre recomendado' })
  @IsNotEmpty()
  @IsString()
  semestre!: string;

  @ApiProperty({ example: 'Engenharia de Software', description: 'Área técnica' })
  @IsNotEmpty()
  @IsString()
  areaTecnica!: string;

}
