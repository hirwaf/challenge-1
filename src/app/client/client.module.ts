import * as redisStore from 'cache-manager-redis-store';
import { CacheModule, Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientEntity } from './entities/client.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RedisModule } from 'nestjs-redis';
import { MongooseModule } from '@nestjs/mongoose';
import { DataList, DataListSchema } from './schemas/data.list';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClientEntity]),
    MongooseModule.forFeature([
      { name: DataList.name, schema: DataListSchema },
    ]),
    CacheModule.register({
      store: redisStore,
      url: process.env.REDIS_URL,
    }),
    ClientsModule.register([
      {
        name: 'EXCEL_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: [process.env.NATS_URL],
        },
      },
    ]),
    RedisModule.register({
      url: process.env.REDIS_URL,
      keyPrefix: 'rssb_',
      keepAlive: 1000 * 3600,
    }),
  ],
  providers: [ClientService],
  controllers: [ClientController],
  exports: [ClientService],
})
export class ClientModule {}
