import * as express from 'express';
import * as crypto from 'crypto';
import * as store from '@src/store';

import { getImageName } from '../../registry-fudge';

export default function (req: express.Request, res: express.Response, next: any) {
  const name = getImageName(req);
  const { reference } = req.params;

  console.log(name, ' : ', reference);

  store.getManifest(name, reference)
    .then(({ mediaType, data }) => {
      const hash = crypto.createHash('sha256');
      hash.update(data);
      const digest = hash.digest();
      res
        .status(200)
        .contentType(mediaType)
        .set('Content-Length', data.length.toString())
        .header('Docker-Content-Digest', `sha256:${digest.toString('hex')}`)
        .send();
    })
    .catch((e) => {
      next(e);
    });
}
