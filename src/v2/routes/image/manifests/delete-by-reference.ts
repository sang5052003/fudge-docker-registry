import * as express from 'express';

import { getImageName } from '../../registry-fudge';

export default function (req: express.Request, res: express.Response) {
    const name = getImageName(req);
    const reference = req.params.reference;

    console.log("DELETE METADATA: ", name, ' // ', reference);
};
