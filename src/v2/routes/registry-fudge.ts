import * as express from 'express';

export function getImageName(req: express.Request) {
    if(req.query.registry) {
        return req.query.registry + '/' + req.params.name;
    }
    return req.params.name;
}
