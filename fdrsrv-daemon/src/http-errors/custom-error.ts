import { ApiErrorInfo } from '@src/constants/errors';
import HttpError from './base';

interface IOpts {
    name: string;
    message: string;
    status: number;
    details?: any;
}

function toHttpErrorParam(opts: IOpts | ApiErrorInfo): IOpts {
  if (opts instanceof ApiErrorInfo) {
    return {
      name: opts.code,
      message: opts.message,
      status: 404,
      details: opts.description,
    };
  }
  return opts;
}

export default class CustomError extends HttpError {
    public readonly details?: any;

    constructor(opts: IOpts | ApiErrorInfo) {
      super(toHttpErrorParam(opts));
      if (opts instanceof ApiErrorInfo) {
        this.details = opts.description;
      } else {
        this.details = opts.details;
      }
    }
}
