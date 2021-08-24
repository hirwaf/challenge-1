export class CachedDataDto {
  id: string;
  totalPushed = 0;
  totalBatches = 0;

  constructor(args?: any) {
    if (args) {
      Object.assign(this, args);
    }
  }
}
