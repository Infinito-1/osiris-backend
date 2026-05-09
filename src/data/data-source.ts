import { DataSource } from 'typeorm';

import { Usuario } from '../usuario/entities/usuario.entity';
import { Admin } from '../admin/entities/admin.entity';
import { Coordenador } from '../coordenador/entities/coordenador.entity';
import { Demanda } from '../demanda/entities/demanda.entity';
import { Candidatura } from '../candidatura/entities/candidatura.entity';
import { Empreendedor } from '../empreendedor/entities/empreendedor.entity';
import { Grupo } from '../grupo/entities/grupo.entity';
import { HistoricoProjeto } from '../historico_projeto/entities/historico_projeto.entity';
import { Projeto } from '../projeto/entities/projeto.entity';
import { Semestre } from '../semestre/entities/semestre.entity';
import { TipoDemanda } from '../tipo_demanda/entities/tipo_demanda.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'root',
  database: 'db_osiris',
  entities: [
    Usuario,
    Admin,
    Coordenador,
    Demanda,
    Candidatura,
    Empreendedor,
    Grupo,
    HistoricoProjeto,
    Projeto,
    Semestre,
    TipoDemanda,
  ],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false,
});
