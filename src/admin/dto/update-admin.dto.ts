import { IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAdminDto {
  @ApiProperty({ 
    example: false, 
    description: 'Define se a credencial de administrador está ativa no sistema', 
    required: false 
  })
  @IsOptional()
  @IsBoolean()
  admBolAtivo?: boolean;
}