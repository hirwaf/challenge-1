export class RequestQueryDto {
  page = 1;
  perPage = 25;
  failed?: any;

  constructor(args?: any) {
    if (args) {
      Object.assign(this, args);
    }
  }
}
