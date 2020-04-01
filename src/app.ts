import * as express from 'express';
import * as path from 'path';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as logger from 'morgan';

import appEnv from './app-env';

import authRouter from './routes/auth';
import v2Router from './v2/routes';

import HttpError from './http-errors/base';
import CustomError from './http-errors/custom-error';
import UnauthorizedError from './http-errors/unauthorized-error';
import * as http from "http";

const app = express();

const REGEX_CONTENT_TYPE_JSON = /application\/[a-zA-Z0-9\-_.]*\+?json(;.*)?/;

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json({
    inflate: true,
    type: (req: http.IncomingMessage) => {
        const contentType = req.headers["content-type"];
        if(contentType) {
            return REGEX_CONTENT_TYPE_JSON.test(contentType);
        }
        return false;
    },
    verify(req: any, res: any, buf: Buffer, encoding: string): void {
        (req as any)['rawBody'] = buf;
    }
}));
app.use(bodyParser.raw());
// app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const router = express.Router();
router.use((req: express.Request, res, next) => {
    res.setHeader('Docker-Distribution-Api-Version', 'registry/2.0');

    // console.log('*REQUEST*', {
    //     method: req.method,
    //     url: req.url,
    //     headers: req.headers,
    //     // params: req.params,
    //     // query: req.query,
    //     user: (req as any).user,
    // });

    next();
});
router.use('/auth', authRouter);
router.use('/v2', v2Router);
router.use(function (err: any, req: express.Request, res: express.Response, next: any) {
    if(err instanceof HttpError) {
        res.status(err.status);
        if(err.response) {
            res.send(err.response);
        }else if(err.errors) {
            res.send({
                errors: err.errors
            });
        }else if(err instanceof UnauthorizedError) {
            res
                .status(401)
                .header('WWW-Authenticate', `Bearer realm="${appEnv.getAppEndpoint(req) + '/auth/token'}",service="${appEnv.getHost(req)}"`)
                .send({
                    errors: [
                        {
                            code: 'UNAUTHORIZED',
                            message: err.message,
                            details: null
                        }
                    ]
                });
        }else{
            res.send({
                errors: [{
                    code: err.name,
                    message: err.message,
                    details: (err instanceof CustomError) ? err.details : undefined
                }]
            });
        }
    }
});

app.use(appEnv.APP_CONTEXT_PATH, router);

export default app;
