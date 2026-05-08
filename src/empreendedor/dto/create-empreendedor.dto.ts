import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateEmpreendedorDto {
  @IsNotEmpty()
  @IsString()
  empStrEmpresa: string;

  @IsNotEmpty()
  @IsString()
  @Length(14, 14)
  empChaCnpj: string;

  @IsNotEmpty()
  usuIntId: number; // FK para Usuario
}
