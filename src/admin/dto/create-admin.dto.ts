import { IsInt, IsOptional, IsBoolean } from 'class-validator';

export class CreateAdminDto {
  @IsInt()
  usuarioId: number;

  @IsOptional()
  @IsBoolean()
  admBolAtivo?: boolean;
}
