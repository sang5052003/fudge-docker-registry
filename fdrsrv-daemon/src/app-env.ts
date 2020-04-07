import * as express from 'express';
import * as crypto from 'crypto';

import * as path from 'path';

// @ts-ignore
// eslint-disable-next-line
const requireFunc = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require;

const { APP_SUB_DOMAIN } = process.env;

const APP_CONTEXT_PATH = process.env.APP_CONTEXT_PATH || '';

const APP_JWT_SECRET = (() => {
  if (process.env.APP_JWT_SECRET) {
    return process.env.APP_JWT_SECRET;
  }
  return crypto.randomBytes(128).toString('base64')
    .replace(/[/=_-]/g, '')
    .substr(0, 32);
})();

const APP_ALLOW_PUBLIC_PULL = (() => {
  if (process.env.APP_ALLOW_PUBLIC_PULL) {
    return /true|yes|1/i.test(process.env.APP_ALLOW_PUBLIC_PULL);
  }
  return true;
})();

const APP_NEED_LOGIN = (() => {
  if (process.env.APP_NEED_LOGIN) {
    return !/false|no|0/i.test(process.env.APP_NEED_LOGIN);
  }
  return true;
})();

const APP_LOGIN_MODULE = (() => {
  if (process.env.APP_LOGIN_MODULE) {
    return path.resolve(APP_LOGIN_MODULE);
  }
  return undefined;
})() as any;

type LoginFunction = (username: string, password: string) => Promise<boolean> | boolean;

function login(username: string, password: string): Promise<boolean> {
  if (APP_NEED_LOGIN) {
    if (APP_LOGIN_MODULE) {
      const loginFunction: LoginFunction = ((): LoginFunction => {
        const mod = requireFunc(APP_LOGIN_MODULE);
        if (typeof mod.default !== 'undefined') {
          return mod.default as LoginFunction;
        }
        return mod as LoginFunction;
      })();
      return Promise.resolve<boolean>(loginFunction(username, password));
    }
    if (process.env.APP_LOGIN_USERNAME && process.env.APP_LOGIN_PASSWORD) {
      return Promise.resolve(
        (username === process.env.APP_LOGIN_USERNAME)
          && (password === process.env.APP_LOGIN_PASSWORD),
      );
    }
  }
  return Promise.resolve(true);
}

function getAppEndpoint(req: express.Request) {
  if (process.env.APP_ENDPOINT) {
    return process.env.APP_ENDPOINT;
  }
  const host = req.header('x-forwarded-host') || req.header('host');
  return `${req.protocol}://${host}${APP_CONTEXT_PATH}`;
}

function getSelfFullUrl(req: express.Request) {
  return `${getAppEndpoint(req)}/${req.originalUrl.split('?', 2)[0].substring(APP_CONTEXT_PATH.length)}`;
}

function getHost(req: express.Request) {
  return req.hostname;
}

const APP_DATA_DIR = (() => {
  if (process.env.APP_DATA_DIR) {
    return path.resolve(process.env.APP_DATA_DIR);
  }
  return path.resolve('./data/');
})();

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
  getHost,
};
