import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';
import * as streams from 'stream';
import * as mkdirp from 'mkdirp';
import * as crypto from 'crypto';
import * as uuid from 'uuid';

import * as errors from '@src/constants/errors';
import CustomError from '@src/http-errors/custom-error';
import appEnv from '../app-env';

const blobsDir = path.resolve(appEnv.APP_DATA_DIR, 'blobs');

export interface IGetBlobResult {
    file: string;
    stats: fs.Stats;
    contentType: string;
}

class WithDigestStream extends streams.Transform {
    private _hash: crypto.Hash;

    private _digest: Buffer | undefined = undefined;

    constructor(algorithm: string, opts?: streams.TransformOptions) {
      super(opts);
      this._hash = crypto.createHash(algorithm);
    }

    _transform(
      chunk: any, encoding: string, callback: (error?: (Error | null), data?: any) => void,
    ): void {
      this._hash.update(chunk);
      this.push(chunk, encoding);
      callback();
    }

    public getDigest(): string {
      if (!this._digest) {
        this._digest = this._hash.digest();
      }
      return this._digest.toString('hex');
    }
}

export class PutBlobContext {
    private _uploadId: string;

    private _name: string;

    private _digest: string;

    private _path: string;

    private _tempFile: string;

    private _digestAlgorithm: string;

    private _digestValue: string;

    private _computedDigest: string;

    private _stream: any;

    constructor(uploadId: string, name: string, digest: string) {
      this._uploadId = uploadId;
      this._name = name;
      this._digest = digest;

      [this._digestAlgorithm, this._digestValue] = digest.split(':', 2);

      this._path = path.resolve(blobsDir, this._digestAlgorithm, this._digestValue);
      this._tempFile = `${this._path}.tmp.${uuid.v4().replace(/-/g, '').substring(0, 8)}`;
    }

    prepare(): Promise<this> {
      return mkdirp(path.dirname(this._path))
        .then(() => this);
    }

    simpleWrite(data: Buffer | string): Promise<this> {
      const self = this;
      return new Promise<this>((resolve, reject) => {
        fs.writeFile(this._tempFile, data, (err) => {
          if (err) reject(err);
          else resolve(self);
        });
      });
    }

    createWriteStream(): streams.Writable {
      const fstream = fs.createWriteStream(this._tempFile);
      const dstream = new WithDigestStream(this._digestAlgorithm);
      this._stream = dstream;
      dstream.on('end', () => {
        this._computedDigest = dstream.getDigest();
      });
      dstream.pipe(fstream);
      return dstream;
    }

    commit(): Promise<void> {
      return util.promisify(fs.rename)(this._tempFile, this._path);
    }

    getDigestAlgorithm(): string {
      return this._digestAlgorithm;
    }

    getDigest(): string {
      return `${this._digestAlgorithm}:${this._computedDigest}`;
    }

    validate(): boolean {
      return this._computedDigest.toLowerCase() === this._digestValue.toLowerCase();
    }
}

export function getBlob(name: string, reference: string): Promise<IGetBlobResult> {
  return new Promise<IGetBlobResult>(async (resolve, reject) => {
    const tokens = reference.split(':', 2);
    const file = path.join(blobsDir, tokens[0], tokens[1]);
    let stats: fs.Stats;
    try {
      stats = await util.promisify(fs.stat)(file);
    } catch (e) {
      if (e.code === 'ENOENT') {
        reject(new CustomError(errors.DIGEST_INVALID));
        return;
      }
      reject(e);
      return;
    }

    resolve({
      file,
      stats,
      contentType: 'application/octet-stream',
    });
  });
}

export function preparePutBlob(
  uploadId: string, name: string, digest: string,
): Promise<PutBlobContext> {
  try {
    const ctx = new PutBlobContext(uploadId, name, digest);
    return ctx.prepare()
      .then(() => ctx);
  } catch (e) {
    return Promise.reject(e);
  }
}
