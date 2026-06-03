import { IsOptional, IsString, IsInt, IsEnum, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatusProjeto } from './status-projeto.enum';

export class UpdateHistoricoProjetoDto {
  @ApiProperty({ example: 'Descrição atualizada', required: false })
  @IsOptional()
  @IsString()
  hspStrDesc?: string;

  @ApiProperty({ example: 'https://github.com/usuario/repositorio', description: 'Link do repositório ou deploy do projeto' })
  @IsOptional()
  @IsUrl()
  hspStrLinkProjeto?: string;

  @ApiProperty({ example: 'https://github.com/usuario/repositorio', description: 'Link do repositório do projeto' })
  @IsOptional()
  @IsUrl()
  hspStrLinkGithub?: string;

  @ApiProperty({ example: 'https://meuprojeto.com', description: 'Link do deploy do projeto' })
  @IsOptional()
  @IsUrl()
  hspStrLinkDeploy?: string;

  @ApiProperty({ example: 'Bloqueado', enum: StatusProjeto, required: false })
  @IsOptional()
  @IsEnum(StatusProjeto)
  hspStrStatus?: StatusProjeto;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  proIntId?: number;
}