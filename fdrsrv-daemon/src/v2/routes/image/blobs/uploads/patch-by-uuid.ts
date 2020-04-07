import * as express from 'express';

import { checkAuth } from '@src/v2/routes/check-authorization';
import { getImageName } from '../../../registry-fudge';

export default function (req: express.Request, res: express.Response, next: any) {
  const authResult = checkAuth(req);
  if (authResult.error) {
    next(authResult.error);
    return;
  }

  const name = getImageName(req);

  console.log('PATCH IMAGE:', name);

  res
    .sendStatus(501); // Not implemented
}
