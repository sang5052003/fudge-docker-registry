import * as express from 'express';
import * as store from '@src/store';

import computeDigest from '@src/utils/digest';

export default function (req: express.Request, res: express.Response, next: any) {
  const { registry } = req.query;
  const { name, reference } = req.params;

  store.getManifest({
    registry, name, reference
  })
    .then(({ mediaType, data }) => {
      const digest = computeDigest(data);

      res
        .status(200)
        .contentType(mediaType)
        .set('Content-Length', data.length.toString())
        .header('Docker-Content-Digest', digest)
        .send();
    })
    .catch((e) => {
      next(e);
    });
}
