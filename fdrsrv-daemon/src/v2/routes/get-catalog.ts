import * as express from 'express';
import * as store from '@src/store';

import CustomError from '@src/http-errors/custom-error';

export default function (req: express.Request, res: express.Response, next: any) {
  const { registry } = req.query;

  store.dbIsolateRun<string[]>((db) => new Promise<string[]>((resolve, reject) => {
    const repoList: string[] = [];
    db.each(
      'SELECT DISTINCT `name` FROM `manifest`',
      (err, row) => {
        if (!err) {
          if (registry) {
            if (row.name.startsWith(registry)) {
              repoList.push(row.name.substring(registry.length + 1));
            }
          } else {
            repoList.push(row.name);
          }
        }
      },
      (err) => {
        if (err) reject(err);
        else resolve(repoList);
      },
    );
  })).then((repoList) => {
    res
      .status(200)
      .send({
        repositories: repoList,
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
