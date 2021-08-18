import { HttpStatus } from '@nestjs/common';

export const HttpResponse = (
  message: string,
  data = {},
  statusCode = HttpStatus.OK,
) => {
  return {
    statusCode,
    message,
    data: data,
  };
};
