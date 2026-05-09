import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Define timezone
  process.env.TZ = '-03:00';

  // Validação global dos DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove propriedades não declaradas nos DTOs
      forbidNonWhitelisted: true, // erro se enviar propriedades extras
      transform: true, // transforma payloads em objetos das classes
    }),
  );

  // CORS liberado em dev
  app.enableCors();

  // Exemplo de CORS restrito em produção
  // app.enableCors({
  //   origin: 'https://osiris-fateczl.netlify.app',
  //   methods: 'GET,POST,PUT,DELETE',
  //   allowedHeaders: 'Content-Type, Authorization',
  // });

  // 🔑 Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('API Osiris')
    .setDescription('Documentação da API do Projeto Integrador Fatec ZL')
    .setVersion('1.0')
    .addBearerAuth() // suporte a JWT nos endpoints
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT ?? 4000;
  await app.listen(port);

  Logger.log(`🚀 Aplicação rodando em http://localhost:${port}`, 'Bootstrap');
  Logger.log(`📖 Swagger disponível em http://localhost:${port}/api-docs`, 'Swagger');
}
bootstrap();
