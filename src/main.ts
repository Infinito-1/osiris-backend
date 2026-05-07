import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

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

  const port = process.env.PORT ?? 4000;
  await app.listen(port);

  Logger.log(`🚀 Aplicação rodando em http://localhost:${port}`, 'Bootstrap');
}
bootstrap();
