import { IsOptional, IsString, IsInt, IsEnum, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatusProjeto } from './status-projeto.enum';

export class UpdateHistoricoProjetoDto {
  @ApiProperty({ example: 'Descrição atualizada', required: false })
  @IsOptional()
  @IsString()
  hspStrDesc?: string;

  @ApiProperty({ example: 'https://github.com/usuario/repositorio-novo', required: false })
  @IsOptional()
  @IsUrl()
  hspStrLinkProjeto?: string;

  @ApiProperty({ example: 'Bloqueado', enum: StatusProjeto, required: false })
  @IsOptional()
  @IsEnum(StatusProjeto)
  hspStrStatus?: StatusProjeto;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  proIntId?: number;
}