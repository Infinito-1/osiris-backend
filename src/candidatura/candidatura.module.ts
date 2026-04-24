import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Candidatura } from './entities/candidatura.entity';
import { CandidaturaService } from './services/candidatura.service';
import { CandidaturaController } from './controllers/candidatura.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Candidatura])],
  providers: [CandidaturaService],
  controllers: [CandidaturaController],
  exports: [],
})
export class CandidaturaModule {}
