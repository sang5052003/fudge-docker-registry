import * as express from 'express';

import { getImageName } from '../../registry-fudge';

export default function (req: express.Request, res: express.Response) {
  const name = getImageName(req);
  const { reference } = req.params;

  console.log('DELETE METADATA: ', name, ' // ', reference);

  res
    .sendStatus(501); // 501 Not Implemented
}
