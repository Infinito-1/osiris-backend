import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateProjetoDto {
  @IsNotEmpty()
  @IsString()
  proStrDescricao: string;

  @IsNotEmpty()
  @IsDateString()
  proDateInicio: Date;

  @IsNotEmpty()
  canIntId: number; // FK para Candidatura
}
