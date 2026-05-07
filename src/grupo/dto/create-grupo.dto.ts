import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateGrupoDto {
  @IsNotEmpty()
  @IsString()
  gruStrNome: string;

  @IsNotEmpty()
  @IsString()
  gruStrDescricao: string;

  @IsNotEmpty()
  @IsString()
  gruIntLider: string;

  @IsNotEmpty()
  @IsString()
  gruChaRa: string;

  @IsNotEmpty()
  @IsNumber()
  gruIntTamanho: number;

  @IsOptional()
  @IsString()
  gruStrMembros?: string;

  @IsNotEmpty()
  usuIntId: number; // FK para Usuario
}
