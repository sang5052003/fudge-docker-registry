import * as express from 'express';
import { validationResult } from 'express-validator';

import * as jwt from 'jsonwebtoken';
import * as uuid from 'uuid';

import appEnv from '../../app-env';

function getScope(req: express.Request): string[] | undefined {
    if(req.query['scope']) {
        return req.query['scope'].split(':')
            .map((v: string, i: number, a: string[]) => (a[0].toLowerCase() === 'repository' && i != 1) ? v.toLowerCase() : v);
    }
    return undefined;
}

function isScopeRepositoryPull(scope: string[]) {
    return (scope[0] === 'repository') && (scope[2] === 'pull');
}

function issueToken(opts: {
    req: express.Request,
    scope?: string[],
    id: string
}) {
    const issuedAt = new Date();
    const jti = uuid.v4();
    const token = jwt.sign({
        iss: appEnv.getHost(opts.req),
        nbf: (Math.floor(issuedAt.getTime() / 1000) - 60),
        jti,
        scope: opts.scope,
        user_id: opts.id
    }, appEnv.APP_JWT_SECRET, {
        expiresIn: '3000000s'
    });
    return {
        token: token,
        access_token: token,
        expires_in: 300,
        issued_at: issuedAt.toISOString()
    };
}

function sendUnauthorized(req: express.Request, res: express.Response, message?: string) {
    res
        .header('WWW-Authenticate', `Bearer realm="${appEnv.getAppEndpoint(req) + '/auth/token'}",service="${appEnv.getHost(req)}"`)
        .status(401)
        .send([
            {
                code: 'UNAUTHORIZED',
                message: 'authentication required',
                details: message ? message : null
            }
        ]);
}

export default(req: express.Request, res: express.Response) => {
    let errors = validationResult(req);
    if(!errors.isEmpty()) {
        res
            .status(400)
            .send([{
                code: 'BadReqeust',
                message: 'Wrong arguments',
                details: errors.array()
            }]);
        return ;
    }

    const scope = getScope(req);
    const authorizationHeader = req.header('authorization');
    if(!authorizationHeader) {
        if(appEnv.APP_ALLOW_PUBLIC_PULL && (!scope || isScopeRepositoryPull(scope))) {
            const token = issueToken({
                id: '',
                req,
                scope: scope ? [scope.join(':')] : []
            });
            res
                .status(200)
                .send(token);
        }else{
            sendUnauthorized(req, res);
        }
        return ;
    }

    const idpw = Buffer.from(authorizationHeader.split(' ', 2)[1], 'base64').toString().split(':');

    appEnv.login(idpw[0], idpw[1])
        .then(loginResult => {
            console.log('loginResult => ', loginResult);
            if(loginResult) {
                const token = issueToken({
                    id: idpw[0],
                    req,
                    scope: [scope.join(':')]
                });
                console.log(token);
                res
                    .status(200)
                    .send(token);
            }else{
                sendUnauthorized(req, res, 'incorrect username or password');
            }
        });
};
