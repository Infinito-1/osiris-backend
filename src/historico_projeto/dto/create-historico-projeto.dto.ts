import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateHistoricoProjetoDto {
  @IsNotEmpty()
  @IsString()
  hspStrDesc: string;

  @IsNotEmpty()
  @IsString()
  hspStrLinkProjeto: string;

  @IsNotEmpty()
  @IsString()
  hspStrStatus: string;

  @IsNotEmpty()
  @IsDateString()
  hspDateData: Date;

  @IsNotEmpty()
  proIntId: number; // FK para Projeto
}
