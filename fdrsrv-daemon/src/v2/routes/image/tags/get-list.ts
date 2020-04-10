import * as express from 'express';
import * as store from '@src/store';

import CustomError from '@src/http-errors/custom-error';
import { getImageName } from '../../registry-fudge';

export default function (req: express.Request, res: express.Response, next: any) {
  const simpleName = req.params.name;
  const name = getImageName(req);

  store.dbIsolateRun<string[]>((db) => new Promise<string[]>((resolve, reject) => {
    const tagList: string[] = [];
    db.each(
      'SELECT `name`,`tag`,`uploaded_at` FROM `manifest` WHERE `name`=? GROUP BY (`name`,`tag`)',
      [name],
      (err, row) => {
        if (!err) {
          tagList.push(row.tag);
        }
      },
      (err: Error) => {
        if (err) reject(err);
        else resolve(tagList);
      },
    );
  })).then((tagList) => {
    res
      .status(200)
      .send({
        name: simpleName,
        tags: tagList,
      });
  }).catch((err) => {
    console.error(err);
    next(new CustomError({
      name: 'ServerError',
      message: 'DB Error',
      status: 500,
    }));
  });
}
