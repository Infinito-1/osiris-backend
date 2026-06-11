// src/empreendedor/empreendedor.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../mail/mail.module'; // <--- ADICIONE ESTE IMPORT
import { EmpreendedorService } from './services/empreendedor.service';
import { EmpreendedorController } from './controllers/empreendedor.controller';
import { Empreendedor } from './entities/empreendedor.entity';
import { Usuario } from '../usuario/entities/usuario.entity'; 
import { Demanda } from '../demanda/entities/demanda.entity'; 
import { Candidatura } from '../candidatura/entities/candidatura.entity'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Empreendedor, 
      Usuario, 
      Demanda, 
      Candidatura
    ]),
    MailModule, 
  ],
  controllers: [EmpreendedorController],
  providers: [EmpreendedorService],
  exports: [EmpreendedorService], 
})
export class EmpreendedorModule {}