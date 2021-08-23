import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UploadedDataDto } from './dto/uploaded.data.dto';
import { splitToBulks } from '../../helpers/mapping';
import { Cache } from 'cache-manager';
import { v4 as uuid } from 'uuid';
import { ProcessedDataDto } from './dto/processed-data.dto';

@Injectable()
export class ClientService {
  logger = new Logger('Client');

  //
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    @Inject('EXCEL_SERVICE')
    private readonly client: ClientProxy,
  ) {}

  /**
   * Start the processing of data
   *
   * @param data
   * @return Promise<boolean>
   */
  async startDataProcessing(data: any) {
    try {
      const id: string = uuid();
      let chunkNumber = 1;
      //
      const chunkData = splitToBulks(data);
      const cacheData = new ProcessedDataDto({
        id,
        pushedPushed: data.length,
        processedNumber: 0,
        numberOfBatches: chunkData.length,
        data: [],
      });
      await this.cacheManager.set<ProcessedDataDto>(id, cacheData, {
        ttl: 0,
      });
      //
      for (const chunk of chunkData) {
        const uploadedData = new UploadedDataDto();
        uploadedData.id = id;
        uploadedData.excelData = chunk;
        uploadedData.chunkNumber = chunkNumber++;
        //
        await this.client.emit<UploadedDataDto>(
          'processing-excel-data',
          uploadedData,
        );
      }
      return id;
    } catch (e) {
      this.logger.error(e.message);
      return false;
    }
  }

  /**
   * @param id
   */
  async getDataFromCache(id: string): Promise<ProcessedDataDto | null> {
    try {
      const data = await this.cacheManager.get<ProcessedDataDto>(id);
      return data;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
