import * as express from 'express';
import * as uuid from 'uuid';

import appEnv from '@src/app-env';
import * as store from '@src/store';

import CustomError from '@src/http-errors/custom-error';
import { getImageName } from '../../../registry-fudge';

import { checkAuth } from '../../../check-authorization';

export default function (req: express.Request, res: express.Response, next: any) {
  const authResult = checkAuth(req);
  if (authResult.error) {
    next(authResult.error);
    return;
  }

  const name = getImageName(req);

  const now = new Date();
  const uploadId = uuid.v4();

  store.dbIsolateRun((db) => new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO `upload` (`upload_uuid`, `created_at`, `image_name`, `user_jti`, `user_id`) VALUES (?, ?, ?, ?, ?)',
      [uploadId, now.getTime(), name, authResult.user.jti, authResult.user.user_id],
      (err) => {
        if (err) reject(err);
        else resolve();
      },
    );
  })).then(() => {
    res
      .header('Docker-Upload-UUID', uploadId)
      .header('Location', `${appEnv.APP_CONTEXT_PATH}/v2/${name}/blobs/uploads/${uploadId}`)
      .status(202) // 202 Accepted
      .send('');
  }).catch((err) => {
    console.error(err);
    next(new CustomError({
      name: 'ServerError',
      message: 'DB Error',
      status: 500,
    }));
  });
}
