import * as express from 'express';
import * as crypto from 'crypto';

import * as path from 'path';

//@ts-ignore
const requireFunc = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require;

const APP_SUB_DOMAIN = process.env.APP_SUB_DOMAIN;

const APP_CONTEXT_PATH = (() => {
    const envValue = process.env.APP_CONTEXT_PATH;
    if(!envValue)
        return '';
 })();

const APP_JWT_SECRET = (() => {
    if(process.env.APP_JWT_SECRET) {
        return process.env.APP_JWT_SECRET;
    }
    return crypto.randomBytes(128).toString('base64').replace(/[\/=\-_]/g, '').substr(0, 32);
})();

const APP_ALLOW_PUBLIC_PULL = (() => {
    if(process.env.APP_ALLOW_PUBLIC_PULL) {
        return /true|yes|1/i.test(process.env.APP_NO_LOGIN);
    }
    return true;
})();

const APP_NEED_LOGIN = (() => {
    if(process.env.APP_NEED_LOGIN) {
        return !/false|no|0/i.test(process.env.APP_NEED_LOGIN);
    }
    return true;
})();

const APP_LOGIN_MODULE = (() => {
    if(process.env.APP_LOGIN_MODULE) {
        return path.resolve(APP_LOGIN_MODULE);
    }
    return path.resolve('./login.js');
})() as any;

function login(username: string, password: string): Promise<boolean> {
    if(APP_NEED_LOGIN) {
        if(process.env.APP_LOGIN_USERNAME && process.env.APP_LOGIN_PASSWORD) {
            console.log(username, '  ' , password);
            return Promise.resolve((username === process.env.APP_LOGIN_USERNAME) && (password === process.env.APP_LOGIN_PASSWORD));
        }
        const mod = requireFunc(APP_LOGIN_MODULE);
        if(typeof mod.default !== 'undefined') {
            return mod.default;
        }else{
            return mod;
        }
    }
    return Promise.resolve(true);
}

function getAppEndpoint(req: express.Request) {
    if(process.env.APP_ENDPOINT) {
        return process.env.APP_ENDPOINT
    }
    let host = req.header('x-forwarded-host') || req.header('host');
    return req.protocol + '://' + host + APP_CONTEXT_PATH;
}

function getSelfFullUrl(req: express.Request) {
    return getAppEndpoint(req) + '/' + req.originalUrl.split('?', 2)[0].substring(APP_CONTEXT_PATH.length);
}

function getHost(req: express.Request) {
    return req.hostname;
}

const APP_DATA_DIR = 'D:\\jcworkspace\\static-docker-registry\\static-docker-registry-server\\data';

export default {
    APP_SUB_DOMAIN,
    APP_CONTEXT_PATH,
    APP_JWT_SECRET,
    APP_ALLOW_PUBLIC_PULL,
    APP_NEED_LOGIN,
    APP_DATA_DIR,
    login,
    getAppEndpoint,
    getSelfFullUrl,
    getHost
};
