import { RowsDataDto } from './rows.data.dto';

export class ProcessedDataDto {
  id: string;
  pushedPushed: number;
  processedNumber: number;
  numberOfBatches: number;
  data: RowsDataDto[];

  constructor(args?: any) {
    if (args) {
      Object.assign(this, args);
    }
  }
}
