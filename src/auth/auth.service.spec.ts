import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsuarioService } from '../usuario/services/usuario.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usuarioService: UsuarioService;
  let jwtService: JwtService;

  const mockUsuarioService = {
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked_jwt_token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsuarioService, useValue: mockUsuarioService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usuarioService = module.get<UsuarioService>(UsuarioService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('deve retornar os dados do usuário sem a senha se as credenciais estiverem corretas', async () => {
      const senhaHash = await bcrypt.hash('senha123', 10);
      const mockUsuario = {
        usuIntId: 1,
        usuStrEmail: 'teste@osiris.com',
        usuStrSenha: senhaHash,
        usuStrTipo: 'Empreendedor',
      };

      mockUsuarioService.findByEmail.mockResolvedValue(mockUsuario);

      const resultado = await service.validateUser('teste@osiris.com', 'senha123');
      
      expect(resultado).toBeDefined();
      expect(resultado.usuStrEmail).toBe('teste@osiris.com');
      expect(resultado.usuStrSenha).toBeUndefined(); // Senha precisa ser omitida por segurança
    });

    it('deve retornar null se a senha estiver incorreta', async () => {
      const senhaHash = await bcrypt.hash('senha123', 10);
      const mockUsuario = { usuIntId: 1, usuStrEmail: 'teste@osiris.com', usuStrSenha: senhaHash };

      mockUsuarioService.findByEmail.mockResolvedValue(mockUsuario);

      const resultado = await service.validateUser('teste@osiris.com', 'senha_errada');
      expect(resultado).toBeNull();
    });
  });

  describe('login', () => {
    it('deve emitir um access_token assinado contendo ID e papel do usuário', async () => {
      const mockUsuarioPayload = { usuIntId: 5, usuStrEmail: 'coordenador@cps.sp.gov.br', usuStrTipo: 'Coordenador' };
      
      const resultado = await service.login(mockUsuarioPayload);

      expect(resultado).toHaveProperty('access_token');
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'coordenador@cps.sp.gov.br',
        sub: 5,
        role: 'Coordenador',
      });
    });
  });
});