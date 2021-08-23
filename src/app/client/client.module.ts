import * as redisStore from 'cache-manager-redis-store';
import { CacheModule, Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientEntity } from './entities/client.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClientEntity]),
    CacheModule.register({
      store: redisStore,
      url: process.env.REDIS_URL,
    }),
    ClientsModule.register([
      {
        name: 'EXCEL_SERVICE',
        transport: Transport.REDIS,
        options: {
          url: process.env.REDIS_URL,
        },
      },
    ]),
  ],
  providers: [ClientService],
  controllers: [ClientController],
  exports: [ClientService],
})
export class ClientModule {}
