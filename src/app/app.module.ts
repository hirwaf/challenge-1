import { Module } from '@nestjs/common';
import 'reflect-metadata';
import { ConfigModule, ConfigService } from 'nestjs-config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ClientModule } from './client/client.module';
import { MongooseModule } from '@nestjs/mongoose';

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
    //
    MongooseModule.forRoot(process.env.MONGO_URL),
    //
    AuthModule,
    UserModule,
    ClientModule,
  ],
})
export class AppModule {}
