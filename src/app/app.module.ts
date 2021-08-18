import { Module } from '@nestjs/common';
import 'reflect-metadata';
import { ConfigModule, ConfigService } from 'nestjs-config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

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
        name: 'CACHE_SERVICE',
        transport: Transport.REDIS,
        options: {
          url: process.env.REDIS_URL,
        },
      },
    ]),
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
