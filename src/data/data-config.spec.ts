import { DevService } from './dev.service';
import { ProdService } from './prod.service';

describe('Data Configuration Services', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('DevService', () => {
    it('deve retornar configurações locais seguras para desenvolvimento', () => {
      process.env.DB_HOST = 'localhost';
      process.env.DB_PORT = '5432';
      process.env.DB_USERNAME = 'postgres';
      process.env.DB_PASSWORD = 'root';
      process.env.DB_DATABASE = 'db_osiris';

      const service = new DevService();
      const options = service.createTypeOrmOptions();

      expect(options.type).toBe('postgres');
      expect(options.synchronize).toBe(false); 
      expect(options.logging).toBe(true);
      expect(options).toHaveProperty('host', 'localhost');
      expect(options).toHaveProperty('database', 'db_osiris');
      expect(options).not.toHaveProperty('url');
    });
  });

  describe('ProdService', () => {
    it('deve retornar configurações baseadas em URL e SSL obrigatoriamente para produção', () => {
      process.env.DATABASE_URL = 'postgres://user:pass@host:5432/db_prod';
      process.env.DB_SSL = 'true';

      const service = new ProdService();
      const options = service.createTypeOrmOptions();

      expect(options.type).toBe('postgres');
      expect(options.synchronize).toBe(false);
      expect(options.logging).toBe(false); 
      expect(options).toHaveProperty('url', 'postgres://user:pass@host:5432/db_prod');
      
      // Validação segura usando reflexão de propriedade do Jest
      expect(options).toHaveProperty('ssl');
      expect(options).not.toHaveProperty('host'); 
    });

    it('deve desativar SSL se DB_SSL for explicitamente string "false"', () => {
      process.env.DATABASE_URL = 'postgres://user:pass@host:5432/db_prod';
      process.env.DB_SSL = 'false';

      const service = new ProdService();
      const options = service.createTypeOrmOptions();

      // Valida dinamicamente o valor booleano injetado na propriedade complexa
      expect(options).toHaveProperty('ssl', false);
    });
  });
});