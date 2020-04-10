import * as express from 'express';

import * as store from '@src/store';

export default function (req: express.Request, res: express.Response, next: any) {
  const { registry } = req.query;
  const { name, reference } = req.params;

  store.getManifest({
    registry, name, reference
  })
    .then(({ mediaType, data }) => {
      res
        .status(200)
        .contentType(mediaType)
        .send(data);
    })
    .catch((e) => next(e));
}
