import { IsNotEmpty, IsString, IsDateString, IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjetoDto {
  @ApiProperty({ example: 'Desenvolvimento do Sistema de Triagem Osiris', description: 'Escopo/Descrição do projeto' })
  @IsNotEmpty()
  @IsString()
  proStrDescricao: string;

  @ApiProperty({ example: '2026-05-18', description: 'Data de início oficial do projeto' })
  @IsNotEmpty()
  @IsDateString()
  proDateInicio: Date;

  @ApiProperty({ example: 42, description: 'ID da Candidatura aprovada que gerou este projeto', required: false})
  @IsOptional()
  @IsInt()
  canIntId: number;
}