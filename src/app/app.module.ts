import { Module } from '@nestjs/common';
import 'reflect-metadata';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from 'nestjs-config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import { ClientsModule, Transport } from '@nestjs/microservices';

const ENV = process.env.NODE_ENV;
//
@Module({
  imports: [
    ConfigModule.resolveRootPath(__dirname + '/../../').load(
      'config/**/!(*.d).{ts,js}',
      {
        path: path.resolve(process.cwd(), !ENV ? '.env' : `.env.${ENV}`),
      },
    ),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => config.get('database'),
      inject: [ConfigService],
    }),
    ClientsModule.register([
      {
        name: process.env.REDIS_PROVIDER,
        transport: Transport.REDIS,
        options: {
          url: process.env.REDIS_URL,
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
