import * as path from 'path';
import * as express from 'express';

import * as store from '@src/store';

export default function (req: express.Request, res: express.Response, next: any) {
  const { registry } = req.query;
  const { name, digest } = req.params;

  store.getBlob({
    registry, name, digest
  })
    .then(({ file, stats }) => {
      const digestAlgorithm = path.basename(path.dirname(file));
      const digestHash = path.basename(file);
      const digestText = `${digestAlgorithm}:${digestHash}`;
      res
        .status(200)
        .header('Content-Length', stats.size.toString())
        .header('Docker-Content-Digest', digestText)
        .send();
    })
    .catch((e) => next(e));
}
