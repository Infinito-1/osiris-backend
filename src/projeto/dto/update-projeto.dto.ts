import { IsOptional, IsString, IsDateString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProjetoDto {
  @ApiProperty({ example: 'Descrição atualizada do escopo', required: false })
  @IsOptional()
  @IsString()
  proStrDescricao?: string;

  @ApiProperty({ example: '2026-06-01', required: false })
  @IsOptional()
  @IsDateString()
  proDateInicio?: Date;

  @ApiProperty({ example: 42, required: false })
  @IsOptional()
  @IsInt()
  canIntId?: number;
}
