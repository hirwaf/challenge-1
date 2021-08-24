export class RowsDataDto {
  names?: string;
  nid?: bigint;
  phoneNumber?: bigint;
  gender?: string;
  email?: string;
  hasError: boolean;
  allErrors?: [];
  processId: string;
  batchId: number;
  totalPushed: number;
  processedOn: number;

  constructor(args?: any) {
    if (args) {
      Object.assign(this, args);
    }
  }
}
