import * as express from 'express';

import * as store from '@src/store';

import { getImageName } from '../../registry-fudge';

export default function (req: express.Request, res: express.Response, next: any) {
    const name = getImageName(req);
    const reference = req.params.reference;

    store.getManifest(name, reference)
        .then(({mediaType, data}) => {
            res
                .status(200)
                .contentType(mediaType)
                .send(data);
        })
        .catch(e => next(e));
};
