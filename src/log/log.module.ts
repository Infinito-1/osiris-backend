import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogAcao } from './entities/log-acao.entity';
import { LogService } from './services/log.service';

@Module({
  imports: [TypeOrmModule.forFeature([LogAcao])],
  providers: [LogService],
  exports: [LogService],
})
export class LogModule {}
