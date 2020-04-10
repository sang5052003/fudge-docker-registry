import * as fs from 'fs';
import * as express from 'express';

import * as store from '@src/store';

export default function (req: express.Request, res: express.Response, next: any) {
  const { registry } = req.query;
  const { name, digest } = req.params;

  store.getBlob({
    registry, name, digest
  })
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
