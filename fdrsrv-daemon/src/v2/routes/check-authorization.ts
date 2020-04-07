import * as express from 'express';
import UnauthorizedError from '@src/http-errors/unauthorized-error';

export interface IAuth {
    jti: string;
    user_id: string;
}

export type ICheckAuthResult = {
    error: Error;
    user: null
} | {
    error: null;
    user: IAuth
};

export function checkAuth(req: express.Request): ICheckAuthResult {
  const { user } = req as any;

  if (!user) {
    return {
      error: new UnauthorizedError(),
      user: null,
    };
  }

  return {
    error: null,
    user,
  };
}
