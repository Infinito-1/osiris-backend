import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevService } from '../data/dev.service';
import { ProdService } from '../data/prod.service';

const isProduction = process.env.NODE_ENV === 'production';

@Module({
  providers: [DevService, ProdService],
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: isProduction ? ProdService : DevService,
    }),
  ],
})
export class DataModule {}