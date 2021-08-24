import { RowsDataDto } from '../app/client/dto/rows.data.dto';

export const rowValidator = (eRow): RowsDataDto => {
  let hasError = false;
  const allErrors: string[] = [];
  if (!eRow.Names || eRow.Names.toString().length <= 0) {
    hasError = true;
    allErrors.push('Name is invalid or missing!');
  }
  if (!eRow.NID || eRow.NID.toString().length <= 0) {
    hasError = true;
    allErrors.push('NID is invalid or missing!');
  }
  if (!eRow.PhoneNumber || eRow.PhoneNumber.toString().length <= 0) {
    hasError = true;
    allErrors.push('Phone number is invalid or missing!');
  }
  if (!eRow.Gender || eRow.Gender.toString().length <= 0) {
    hasError = true;
    allErrors.push('Gender is invalid or missing!');
  }
  if (!eRow.Email || eRow.Email.toString().length <= 0) {
    hasError = true;
    allErrors.push('Email is invalid or missing!');
  }
  return new RowsDataDto({
    names: eRow.Names ?? null,
    nid: eRow.NID ? parseInt(eRow.NID.toString()) : null,
    phoneNumber: eRow.PhoneNumber
      ? parseInt(eRow.PhoneNumber.toString())
      : null,
    gender: eRow.Gender ?? null,
    email: eRow.Email ?? null,
    hasError,
    allErrors,
  });
};
