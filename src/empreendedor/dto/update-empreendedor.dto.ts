import { IsString, IsOptional, Length } from 'class-validator';

export class UpdateEmpreendedorDto {
  @IsOptional()
  @IsString()
  empStrEmpresa?: string;

  @IsOptional()
  @IsString()
  @Length(14, 14)
  empChaCnpj?: string;

  @IsOptional()
  usuIntId?: number;
}
