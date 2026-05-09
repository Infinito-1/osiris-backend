import { IsInt, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty({ example: 1, description: 'ID do usuário que será promovido a administrador' })
  @IsInt()
  usuarioId: number;

  @ApiProperty({ example: true, description: 'Define se o administrador está ativo', required: false })
  @IsOptional()
  @IsBoolean()
  admBolAtivo?: boolean;
}
