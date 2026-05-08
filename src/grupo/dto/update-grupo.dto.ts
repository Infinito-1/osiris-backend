import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateGrupoDto {
  @IsOptional()
  @IsString()
  gruStrNome?: string;

  @IsOptional()
  @IsString()
  gruStrDescricao?: string;

  @IsOptional()
  @IsString()
  gruIntLider?: string;

  @IsOptional()
  @IsString()
  gruChaRa?: string;

  @IsOptional()
  @IsNumber()
  gruIntTamanho?: number;

  @IsOptional()
  @IsString()
  gruStrMembros?: string;

  @IsOptional()
  usuIntId?: number;
}
