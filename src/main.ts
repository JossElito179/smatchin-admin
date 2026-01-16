import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { METHODS } from 'http';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: '*',
    METHODS: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    Credential:true,
        allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-KEY',
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Origin',
    ],
    exposedHeaders: [
      'Authorization',
      'X-API-KEY-EXPIRY',
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400,
  });

  await app.listen(process.env.PORT ?? 3000);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
}
bootstrap();
