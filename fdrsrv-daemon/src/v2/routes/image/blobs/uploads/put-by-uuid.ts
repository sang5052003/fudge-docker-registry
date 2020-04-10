import * as express from 'express';

import appEnv from '@src/app-env';

import * as store from '@src/store';

import CustomError from '@src/http-errors/custom-error';
import * as errors from '@src/constants/errors';
import { PutBlobContext } from '@src/store';
import { checkAuth } from '@src/v2/routes/check-authorization';
import { getImageName } from '../../../registry-fudge';

export default function (req: express.Request, res: express.Response, next: any) {
  const name = getImageName(req);
  const uploadId = req.params.uuid;
  const { digest } = req.query;

  const authResult = checkAuth(req);
  if (authResult.error) {
    next(authResult.error);
    return;
  }

  store.preparePutBlob(uploadId, name, digest)
    .then((putContext) => new Promise<PutBlobContext>((resolve, reject) => {
      const writeStream = putContext.createWriteStream();
      req
        .pipe(writeStream)
        .on('end', () => {
          if (!putContext.validate()) {
            reject(new CustomError(errors.DIGEST_INVALID));
            return;
          }
          resolve(putContext);
        })
        .on('error', (e) => reject(e));
    }))
    .then((putContext) => putContext.commit().then(() => putContext))
    .then((putContext) => {
      res
        .status(201) // 201 Created
        .header('Location', `${appEnv.APP_CONTEXT_PATH}/v2/${name}/blobs/${digest}`)
        .header('Docker-Content-Digest', putContext.getDigest())
        .send('');
    })
    .catch((e) => {
      next(e);
    });
}
