import { TypeOrmModule } from '@nestjs/typeorm';
import { Semestre } from './entities/semestre.entity';
import { Module } from '@nestjs/common';
import { SemestreService } from './services/semestre.service';
import { SemestreController } from './controllers/semestre.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Semestre])],
  providers: [SemestreService],
  controllers: [SemestreController],
  exports: [],
})
export class SemestreModule {}
