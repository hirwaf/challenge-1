import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { excelFileFilter } from '../../utils/file.upload';
import { HttpResponse } from '../../helpers/JsonResponse';
import * as XLSX from 'xlsx';
import { ClientService } from './client.service';
import { UploadedDataDto } from './dto/uploaded.data.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('client')
export class ClientController {
  logger = new Logger('ClientController');
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
    await this.clientService.processingData(uploadedData);
  }

  @Post('import/:id/commit')
  async commitImportedData(@Param('id', ParseUUIDPipe) id: string) {
    const committing = await this.clientService.commitImportedData(id);
    //
    return committing;
  }

  /**
   * Reviewing imported data
   * @param id
   * @param req
   */
  @Get('import/:id/review')
  async importedDataReview(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    try {
      return await this.clientService.getDataFromCache(id, req.query);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
