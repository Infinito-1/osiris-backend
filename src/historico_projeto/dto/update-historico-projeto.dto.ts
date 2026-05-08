import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateHistoricoProjetoDto {
  @IsOptional()
  @IsString()
  hspStrDesc?: string;

  @IsOptional()
  @IsString()
  hspStrLinkProjeto?: string;

  @IsOptional()
  @IsString()
  hspStrStatus?: string;

  @IsOptional()
  @IsDateString()
  hspDateData?: Date;

  @IsOptional()
  proIntId?: number;
}
