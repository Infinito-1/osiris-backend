import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTipoDemandaDto {
  @ApiProperty({ example: 'Sistema Web', description: 'Nome do tipo de demanda' })
  @IsNotEmpty()
  @IsString()
  tipStrNome!: string;
}
