import { IsString, IsOptional } from 'class-validator';

// rejeitar-demanda.dto.ts
export class RejeitarDemandaDto {
  @IsOptional()
  @IsString()
  motivo?: string;
}
