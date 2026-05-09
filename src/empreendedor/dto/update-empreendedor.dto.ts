import { IsString, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEmpreendedorDto {
  @ApiProperty({ example: 'InovaTech LTDA', description: 'Novo nome da empresa', required: false })
  @IsOptional()
  @IsString()
  empStrEmpresa?: string;

  @ApiProperty({ example: '98765432000112', description: 'Novo CNPJ da empresa (14 dígitos)', required: false })
  @IsOptional()
  @IsString()
  @Length(14, 14)
  empChaCnpj?: string;

  @ApiProperty({ example: 7, description: 'Novo ID de usuário vinculado ao empreendedor', required: false })
  @IsOptional()
  usuIntId?: number;
}
