import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import * as helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(helmet());
  // add a global route prefix
  app.setGlobalPrefix('api/v1');
  //
  app.useGlobalPipes(new ValidationPipe());
  //
  await app.listen(process.env.EXPRESS_PORT);
}
bootstrap();
