import { TypeOrmModule } from '@nestjs/typeorm';
import { Empreendedor } from './entities/empreendedor.entity';
import { Module } from '@nestjs/common';
import { EmpreendedorService } from './services/empreendedor.service';
import { EmpreendedorController } from './controllers/empreendedor.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Empreendedor])],
  providers: [EmpreendedorService],
  controllers: [EmpreendedorController],
  exports: [],
})
export class EmpreendedorModule {}
