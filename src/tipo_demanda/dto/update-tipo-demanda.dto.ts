import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTipoDemandaDto {
  @ApiProperty({ example: 'Aplicativo Mobile', description: 'Novo nome do tipo de demanda', required: false })
  @IsOptional()
  @IsString()
  tipStrNome?: string;
}
