import * as fs from 'fs';
import * as express from 'express';

import * as store from '@src/store';

import { getImageName } from '../../registry-fudge';

export default function (req: express.Request, res: express.Response, next: any) {
  const name = getImageName(req);
  const { digest } = req.params;

  store.getBlob(name, digest)
    .then(({ file }) => {
      const stream = fs.createReadStream(file);
      stream
        .on('open', () => {
          res.writeHead(200);
        })
        .on('error', (e) => {
          next(e);
        });
      stream.pipe(res);
    })
    .catch((e) => next(e));
}
