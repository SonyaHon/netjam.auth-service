export interface IError {
  code?: string;
  message: string;
}

export type Errorable<T> = IError | T;

export const HTTP_CODE = {
  MALFORMED_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
  OK: 200,
  OK_NO_DATA: 204,
};

export const ERROR_CODE = {
  WRONG_VALIDATION: "0x00",
  CATCHED_ERROR: "0x01",
  USER_NOT_FOUND: "0x02",
};
