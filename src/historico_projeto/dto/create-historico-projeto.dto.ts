import { IsNotEmpty, IsString, IsInt, IsEnum, IsUrl, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatusProjeto } from './status-projeto.enum';

export class CreateHistoricoProjetoDto {
  @ApiProperty({ example: 'Finalização da Sprint 1 - Criação da Base do Banco de Dados', description: 'O que foi feito nesta atualização' })
  @IsNotEmpty()
  @IsString()
  hspStrDesc: string;

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

  @ApiProperty({ example: 'Em Desenvolvimento', enum: StatusProjeto, description: 'Novo status do projeto' })
  @IsNotEmpty()
  @IsEnum(StatusProjeto)
  hspStrStatus: StatusProjeto;

  @ApiProperty({ example: 1, description: 'ID do Projeto associado' })
  @IsNotEmpty()
  @IsInt()
  proIntId: number;
}