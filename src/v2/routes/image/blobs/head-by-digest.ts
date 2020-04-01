import * as path from 'path';
import * as express from 'express';

import * as store from '@src/store';

import { getImageName } from '../../registry-fudge';

export default function (req: express.Request, res: express.Response, next: any) {
    const name = getImageName(req);
    const digest = req.params.digest;

    store.getBlob(name, digest)
        .then(({file, stats, contentType}) => {
            const digestAlgorithm = path.basename(path.dirname(file));
            const digestHash = path.basename(file);
            const digest = digestAlgorithm + ':' + digestHash;
            res
                .status(200)
                .header('Content-Length', stats.size.toString())
                .header('Docker-Content-Digest', digest)
                .send();
        })
        .catch(e =>{
            console.log("HEAD DIGEST ERROR : ", digest, " :: ", e);
            next(e);
        });
};
