import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { DevService } from './data/dev.service';

// Importa todos os módulos da aplicação
import { GrupoModule } from './grupo/grupo.module';
import { EmpreendedorModule } from './empreendedor/empreendedor.module';
import { CoordenadorModule } from './coordenador/coordenador.module';
import { CandidaturaModule } from './candidatura/candidatura.module';
import { DemandaModule } from './demanda/demanda.module';
import { HistoricoProjetoModule } from './historico_projeto/historico_projeto.module';
import { ProjetoModule } from './projeto/projeto.module';
import { SemestreModule } from './semestre/semestre.module';
import { TipoDemandaModule } from './tipo_demanda/tipo_demanda.module';
import { UsuarioModule } from './usuario/usuario.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module'; 
import { MailModule } from './mail/mail.module'; // ✅ importa o módulo de email

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useClass: DevService,
      imports: [ConfigModule],
    }),
    GrupoModule,
    EmpreendedorModule,
    CoordenadorModule,
    CandidaturaModule,
    DemandaModule,
    HistoricoProjetoModule,
    ProjetoModule,
    SemestreModule,
    TipoDemandaModule,
    UsuarioModule,
    AdminModule,
    AuthModule,
    MailModule, // ✅ agora o MailController fica disponível
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
