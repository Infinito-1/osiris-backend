import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Demanda } from '../demanda/entities/demanda.entity';
import { Projeto } from '../projeto/entities/projeto.entity';
import { AdminService } from './services/admin.service';
import { AdminController } from './controllers/admin.controller';
import { MailModule } from '../mail/mail.module';
import { LogModule } from '../log/log.module';
import { Candidatura } from '../candidatura/entities/candidatura.entity';
import { CoordenadorModule } from '../coordenador/coordenador.module';
import { EmpreendedorModule } from '../empreendedor/empreendedor.module';
import { GrupoModule } from '../grupo/grupo.module';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, Usuario, Demanda, Projeto, Candidatura]),
    MailModule, // Vinculado aqui para habilitar os disparos de e-mail de notificação (RN-15)
    LogModule,
    CoordenadorModule,
    EmpreendedorModule,
    GrupoModule,
    UsuarioModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
