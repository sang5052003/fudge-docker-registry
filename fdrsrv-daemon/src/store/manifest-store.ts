
import * as errors from '@src/constants/errors';
import CustomError from '@src/http-errors/custom-error';
import { dbIsolateRun } from './db';

export interface IGetManifestResult {
    mediaType: string;
    data: string;
}

export function getManifest(name: string, reference: string): Promise<IGetManifestResult> {
  return dbIsolateRun<IGetManifestResult>((db) => new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM `image` WHERE `name`=? AND `tag`=?', [name, reference],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (!row) {
          reject(new CustomError(errors.TAG_INVALID));
          return;
        }

        resolve({
          mediaType: row.media_type,
          data: row.manifest,
        });
      },
    );
  }));
}

export function putManifest(name: string, reference: string, data: string): Promise<void> {
  const uploadedAt = new Date();
  const manifest = JSON.parse(data);
  return dbIsolateRun((db) => new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO `image` (`name`, `tag`, `uploaded_at`, `media_type`, `manifest`) VALUES (?, ?, ?, ?, ?)',
      [name, reference, uploadedAt.getTime(), manifest.mediaType, data],
      (err) => {
        if (err) reject(err);
        else resolve();
      },
    );
  }));
}
