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
import { CachedDataDto } from './dto/cached-data.dto';
import { rowValidator } from '../../utils/row.validator';
import { InjectModel } from '@nestjs/mongoose';
import { DataList, DataListDocument } from './schemas/data.list';
import { Model } from 'mongoose';
import { RequestQueryDto } from './dto/request-query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientEntity } from './entities/client.entity';
import {
  EntityManager,
  Repository,
  Transaction,
  TransactionManager,
} from 'typeorm';

@Injectable()
export class ClientService {
  logger = new Logger('Client');

  //
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    //
    @InjectModel(DataList.name)
    private readonly dataList: Model<DataListDocument>,
    //
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>,
    //
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
      const chunkData = splitToBulks(data, 1000);
      const cacheData = new CachedDataDto({
        id,
        totalPushed: data.length,
        totalBatches: chunkData.length,
      });
      await this.cacheManager.set<CachedDataDto>(id, cacheData, {
        ttl: 0,
      });
      //
      for (const chunk of chunkData) {
        const uploadedData = new UploadedDataDto();
        uploadedData.id = id;
        uploadedData.excelData = chunk;
        uploadedData.batchNumber = chunkNumber++;
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
   * Processing data
   * @param uploadedData
   */
  async processingData(uploadedData: UploadedDataDto): Promise<CachedDataDto> {
    this.logger.log(
      `Data processing: ID ${uploadedData.id} -> Batch: ${uploadedData.batchNumber}`,
    );
    try {
      // Validating and processing data
      const dataLen = uploadedData.excelData.length;
      const rawData = uploadedData.excelData;
      let i = 0;
      const rows = [];
      while (i < dataLen) {
        const eRow = rowValidator(rawData[i]);
        eRow.processId = uploadedData.id;
        eRow.batchId = uploadedData.batchNumber;
        eRow.processedOn = i;
        rows.push(eRow);
        i++;
      }
      await this.dataList.insertMany(rows);
    } catch (e) {
      this.logger.error(e.message);
      return null;
    }
  }

  /**
   * Get cached data
   * @param id: string
   * @param query: RequestQueryDto
   * @return Promise<ProcessedDataDto|null
   */
  async getDataFromCache(id: string, query?: RequestQueryDto) {
    try {
      //
      const page = query.page ?? 1;
      const perPage = query.perPage ?? 25;
      // Get only failed items
      const validation = query.failed == 1 ? { hasError: true } : {};
      //
      const data = await this.dataList
        .find({ processId: id, ...validation })
        .select([
          'names',
          'nid',
          'phoneNumber',
          'gender',
          'email',
          'hasError',
          'allErrors',
        ])
        .sort({
          hasError: 'asc',
        })
        .limit(perPage - 1)
        .skip(perPage * (page - 1))
        .exec();
      // Count total items
      const countData = await this.dataList
        .find({ processId: id })
        .countDocuments()
        .exec();
      // Calculate total available pages
      const pages = Math.ceil(countData / perPage);
      //
      const cachedData = await this.cacheManager.get<CachedDataDto>(id);
      const previousPage = page - 1;
      return {
        id: cachedData.id,
        hasFinishedProcessing: countData == cachedData.totalPushed,
        total: countData,
        totalPages: pages,
        currentPage: parseInt(String(page)),
        nextPage: parseInt(String(page)) + 1,
        previousPage: previousPage > 0 ? previousPage : 1,
        perPage: parseInt(String(perPage)),
        data: data,
      };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Commit imported data
   * @param id
   */
  async commitImportedData(id: string) {
    try {
      const data = await this.dataList
        .find({ processId: id })
        .select(['names', 'nid', 'phoneNumber', 'gender', 'email', 'processId'])
        .exec();
      //
      if (data.length > 0) {
        const trans = await this.clientRepository.manager.transaction(
          async (entityManager) => {
            const chunkData = splitToBulks(data, 1000);
            console.debug(chunkData.length);
            for (const chunk of chunkData) {
              await this.clientRepository.insert(chunk);
            }
          },
        );
        if (trans === undefined) {
          await this.cacheManager.del(id);
          await this.dataList.deleteMany({ processId: id });
        }
        return {
          status: HttpStatus.CREATED,
          message: 'Data Committed successfully',
          total: data.length,
        };
      } else {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Process not found',
          total: 0,
        };
      }
    } catch (e) {
      this.logger.log(e.message);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to commit data',
        total: 0,
      };
    }
  }
}
