import * as path from 'path';
import * as sqlite3 from 'sqlite3';

import * as mkdirp from 'mkdirp';

import appEnv from '@src/app-env';

const dbFile = path.resolve(appEnv.APP_DATA_DIR, 'registry.db');
const dbDir = path.dirname(dbFile);
mkdirp.sync(dbDir);
const db = new sqlite3.Database(dbFile);

db.serialize(() => {
  db.exec('PRAGMA journal_mode=WAL');
  db.exec('CREATE TABLE IF NOT EXISTS `manifest` ('
        + '    `name` TEXT,'
        + '    `tag` TEXT,'
        + '    `schema_version` INTEGER,'
        + '    `uploaded_at` INTEGER,'
        + '    `media_type` TEXT, '
        + '    `manifest` TEXT, '
        + '    PRIMARY KEY (`name`, `tag`, `schema_version`)'
        + ')', (err) => {
    if (err) {
      console.error(err);
    }
  });
  db.exec(
    'CREATE TABLE IF NOT EXISTS `upload` ('
        + '    `upload_uuid` TEXT PRIMARY KEY,'
        + '    `created_at` INTEGER, '
        + '    `image_name` TEXT, '
        + '    `user_jti` TEXT, '
        + '    `user_id` TEXT'
        + ')', (err) => {
      if (err) {
        console.error(err);
      }
      console.log('DB CONNECTED!');
    }
  );
});

type DbRunFunction<T> = (db: sqlite3.Database) => PromiseLike<T> | T;

interface IDbWorkQueueItem<T> {
    fn: DbRunFunction<T>;
    resolve: () => T;
    reject: (err: any) => void;
}

interface IDbContext {
    lock: number;
    workQueue: IDbWorkQueueItem<any>[]
}

const dbContext: IDbContext = {
  lock: 0,
  workQueue: []
};

function removeReduce<T>(arr: T[], reducer: (chain: T, item: T) => T, initial: T): T {
  let prev = initial;
  arr.forEach((item: T, index: number, object: T[]) => {
    prev = reducer(prev, item);
    object.splice(index, 1);
  });
  return prev;
}

function runQueue(): Promise<void> {
  return removeReduce<any>(dbContext.workQueue,
    (chain, item) => chain.finally(() => new Promise((resolve) => {
      Promise.resolve(item.fn(db))
        .then(item.resolve)
        .catch(item.reject)
        .finally(resolve);
    })),
    Promise.resolve()).then(() => {
    if (dbContext.workQueue.length > 0) {
      runQueue();
    }
  });
}

function dbIsolateRun<T>(fn: DbRunFunction<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (dbContext.lock) {
      dbContext.workQueue.push({
        fn,
        resolve,
        reject
      });
      return;
    }

    dbContext.lock = 1;
    Promise.resolve(fn(db))
      .then(resolve)
      .catch(reject)
      .finally(() => runQueue()
        .finally(() => {
          dbContext.lock = 0;
        }));
  });
}

export {
  dbIsolateRun
};

export default null;
