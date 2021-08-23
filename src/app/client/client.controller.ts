import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { excelFileFilter } from '../../utils/file.upload';
import { HttpResponse } from '../../helpers/JsonResponse';
import * as XLSX from 'xlsx';
import { ClientService } from './client.service';
import { UploadedDataDto } from './dto/uploaded.data.dto';
import {
  Ctx,
  MessagePattern,
  Payload,
  RedisContext,
} from '@nestjs/microservices';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}
  /**
   * Import clients from excel file
   *
   * @param uploadedFile
   */
  @Post('import')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 104857600, // 100MB works as expected
      },
      fileFilter: excelFileFilter,
    }),
  )
  async importClient(@UploadedFile() uploadedFile: Express.Multer.File) {
    try {
      if (uploadedFile) {
        const workSheetsFromBuffer = await XLSX.read(uploadedFile.buffer);
        const sheets = [];
        workSheetsFromBuffer.SheetNames.forEach((sheetName) => {
          sheets.push(sheetName);
        });
        const excel_rows_json = XLSX.utils.sheet_to_json(
          workSheetsFromBuffer.Sheets[sheets[0]],
        );
        // Length
        // Chunk Data
        //
        const cachingData = await this.clientService.startDataProcessing(
          excel_rows_json,
        );
        //
        return HttpResponse(
          cachingData !== false
            ? 'Processing file started successfully.'
            : 'Failed to start import process',
          {
            processId: cachingData,
          },
          HttpStatus.OK,
        );
      }
      return new HttpException('File required', HttpStatus.BAD_REQUEST);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Processing data
   * @param uploadedData
   */
  @MessagePattern('processing-excel-data')
  async dataProcessing(@Payload() uploadedData: UploadedDataDto) {
    const processId = uploadedData.id;
    const cache = await this.clientService.getDataFromCache(processId);
    console.log([
      processId,
      uploadedData.excelData.length,
      uploadedData.chunkNumber,
      cache,
    ]);
  }

  /**
   * Reviewing imported data
   * @param id
   */
  @Get('import/:id/review')
  async importReview(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const data = await this.clientService.getDataFromCache(id);
      console.log(data);
      return data;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
