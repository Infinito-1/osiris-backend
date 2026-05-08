import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateAdminDto {
  @IsOptional()
  @IsBoolean()
  admBolAtivo?: boolean;
}
