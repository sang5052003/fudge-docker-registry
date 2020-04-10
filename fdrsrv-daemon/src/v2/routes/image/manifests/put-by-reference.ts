import * as express from 'express';
import computeDigest from '@src/utils/digest';

import appEnv from '@src/app-env';

import * as store from '@src/store';

import CustomError from '@src/http-errors/custom-error';
import * as errors from '@src/constants/errors';
import { checkAuth } from '@src/v2/routes/check-authorization';
import { getImageName } from '../../registry-fudge';

const REGEX_DIGEST = /(\w+):([a-fA-F0-9]+)/;

function getDigestFromReference(input: string): string[] | undefined {
  const matchers = REGEX_DIGEST.exec(input);
  if (!matchers) { return undefined; }
  return [
    matchers[1],
    matchers[2]
  ];
}

export default function (req: express.Request, res: express.Response, next: any) {
  const name = getImageName(req);
  const { reference } = req.params;

  const authResult = checkAuth(req);
  if (authResult.error) {
    next(authResult.error);
    return;
  }

  const data = (req as any).rawBody;
  const digestFromRef: string[] | undefined = getDigestFromReference(reference);
  const digestAlgorithm = digestFromRef ? digestFromRef[0] : 'sha256';

  const computedDigest = computeDigest(data, digestAlgorithm);
  const computedHash = computedDigest.split(':')[1].toLowerCase();

  if (digestFromRef && (computedHash !== digestFromRef[1].toLowerCase())) {
    next(new CustomError(errors.DIGEST_INVALID));
    return;
  }

  store.putManifest(name, reference, data)
    .then(() => store.preparePutBlob('', name, computedDigest))
    .then((putContext) => putContext.simpleWrite(data))
    .then((putContext) => putContext.commit().then(() => putContext))
    .then(() => {
      res
        .header('Location', `${appEnv.APP_CONTEXT_PATH}/v2/${name}/manifests/${reference}`)
        .header('Docker-Content-Digest', computedDigest)
        .sendStatus(201);
    })
    .catch((e) => {
      next(e);
    });
}
