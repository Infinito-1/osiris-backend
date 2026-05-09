import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmpreendedorDto {
  @ApiProperty({ example: 'Tech Solutions LTDA', description: 'Nome da empresa do empreendedor' })
  @IsNotEmpty()
  @IsString()
  empStrEmpresa: string;

  @ApiProperty({ example: '12345678000195', description: 'CNPJ da empresa (14 dígitos)' })
  @IsNotEmpty()
  @IsString()
  @Length(14, 14)
  empChaCnpj: string;

  @ApiProperty({ example: 5, description: 'ID do usuário vinculado ao empreendedor' })
  @IsNotEmpty()
  usuIntId: number;
}
