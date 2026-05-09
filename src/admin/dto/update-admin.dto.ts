import { IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAdminDto {
  @ApiProperty({ example: false, description: 'Define se o administrador está ativo', required: false })
  @IsOptional()
  @IsBoolean()
  admBolAtivo?: boolean;
}
