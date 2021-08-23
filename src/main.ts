import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import * as helmet from 'helmet';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      url: process.env.REDIS_URL,
    },
  });
  //
  app.enableCors();
  app.use(helmet());
  // add a global route prefix
  app.setGlobalPrefix('api/v1');
  //
  app.useGlobalPipes(new ValidationPipe());
  //
  await app.startAllMicroservicesAsync();
  await app.listen(process.env.EXPRESS_PORT);
}
bootstrap();
