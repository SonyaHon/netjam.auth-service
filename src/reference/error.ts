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
  FORBIDDEN: 403,
};

export const ERROR_CODE = {
  WRONG_VALIDATION: "0x00",
  CATCHED_ERROR: "0x01",
  USER_NOT_FOUND: "0x02",
  USERNAME_NOT_AVAILABLE: "0x03",
  BAD_TOKEN: "0x04",
};
