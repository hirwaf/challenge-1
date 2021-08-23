import { HttpException, HttpStatus } from '@nestjs/common';

export const excelFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(xlsx)$/)) {
    return callback(
      new HttpException(
        'Only excel files are allowed!',
        HttpStatus.BAD_REQUEST,
      ),
      true,
    );
  }
  callback(null, true);
};
