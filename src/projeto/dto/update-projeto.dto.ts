import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateProjetoDto {
  @IsOptional()
  @IsString()
  proStrDescricao?: string;

  @IsOptional()
  @IsDateString()
  proDateInicio?: Date;

  @IsOptional()
  canIntId?: number;
}
