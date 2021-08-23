import { RowsDataDto } from './rows.data.dto';

export class UploadedDataDto {
  id: string;
  excelData: Array<RowsDataDto>;
  chunkNumber: number;
}
