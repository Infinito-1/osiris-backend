import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coordenador } from './entities/coordenador.entity';
import { CoordenadorService } from './services/coordenador.service';
import { CoordenadorController } from './controllers/coordenador.controller';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Demanda } from '../demanda/entities/demanda.entity';
import { Candidatura } from '../candidatura/entities/candidatura.entity';
import { MailModule } from '../mail/mail.module'; // Importação do seu MailModule
import { LogModule } from '../log/log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Coordenador, Usuario, Demanda, Candidatura]),
    MailModule, // Injetando o módulo de e-mail integrado
    LogModule,
  ],
  providers: [CoordenadorService],
  controllers: [CoordenadorController],
  exports: [CoordenadorService],
})
export class CoordenadorModule {}
