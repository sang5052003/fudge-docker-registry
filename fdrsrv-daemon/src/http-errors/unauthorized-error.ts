import HttpError from './base';

const C_HTTP_ERROR_CHECKER = Symbol('HttpError');
const C_HTTP_ERROR_CHECK_VALUE = 'UnauthorizedError';

export default class UnauthorizedError extends HttpError {
  constructor() {
    super({
      name: 'UnauthorizedError',
      message: 'unauthorized',
      status: 401
    });

    Object.defineProperty(this, C_HTTP_ERROR_CHECKER, { value: C_HTTP_ERROR_CHECK_VALUE });
  }

  public static isInstance(obj: any) {
    return obj[C_HTTP_ERROR_CHECKER] === C_HTTP_ERROR_CHECK_VALUE;
  }
}
