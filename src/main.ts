import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  process.env.TZ = '-03:00';

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors();

  // CORS em produção
  // app.enableCors({
  //   origin: 'https://osiris-fateczl.netlify.app/', // Substitua pelo domínio permitido
  //   methods: 'GET,POST,PUT,DELETE', // Métodos permitidos
  //   allowedHeaders: 'Content-Type, Authorization', // Cabeçalhos permitidos
  // });

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
