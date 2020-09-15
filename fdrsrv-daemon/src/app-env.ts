import * as express from 'express';
import * as crypto from 'crypto';

import * as path from 'path';
import * as fs from 'fs';

import { IFdrsrvConfig } from '../types/fdrsrvd-config';

// @ts-ignore
// eslint-disable-next-line
const requireFunc = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require;

const APP_CONFIG_FILE = (() => {
  if (process.env.APP_CONFIG_FILE) {
    return path.resolve(process.env.APP_CONFIG_FILE);
  }
  const defaultFile = path.resolve('./fdrsrvd.config.js');
  if (fs.existsSync(defaultFile)) {
    return defaultFile;
  }
  return undefined;
})();

const config: IFdrsrvConfig = (() => {
  if (APP_CONFIG_FILE) {
    return requireFunc(APP_CONFIG_FILE);
  }
  return {};
})();

function getEnvironment(key: string): string | undefined {
  if (config.overrideEnvironments) {
    if (config.overrideEnvironments[key]) {
      return config.overrideEnvironments[key];
    }
  }
  return process.env[key];
}

const APP_SUB_DOMAIN = getEnvironment('APP_SUB_DOMAIN');
const APP_CONTEXT_PATH = getEnvironment('APP_CONTEXT_PATH') || '';

const APP_JWT_SECRET = (() => {
  const envValue = getEnvironment('APP_JWT_SECRET');
  if (envValue) {
    return envValue;
  }
  return crypto.randomBytes(128).toString('base64')
    .replace(/[/=_-]/g, '')
    .substr(0, 32);
})();

const APP_ALLOW_PUBLIC_PULL = (() => {
  const envValue = getEnvironment('APP_ALLOW_PUBLIC_PULL');
  if (envValue) {
    return /true|yes|1/i.test(envValue);
  }
  return true;
})();

const APP_NEED_LOGIN = (() => {
  const envValue = getEnvironment('APP_NEED_LOGIN');
  if (envValue) {
    return !/false|no|0/i.test(envValue);
  }
  return true;
})();

function login(username: string, password: string): Promise<boolean> {
  if (APP_NEED_LOGIN) {
    if (config.login) {
      return Promise.resolve<boolean>(config.login(username, password));
    }
    const envUsername = getEnvironment('APP_LOGIN_USERNAME');
    const envPassword = getEnvironment('APP_LOGIN_PASSWORD');
    if (envUsername && envPassword) {
      return Promise.resolve(
        (username === envUsername)
          && (password === envPassword)
      );
    }
  }
  return Promise.resolve(true);
}

function getAppEndpoint(req: express.Request) {
  const envValue = getEnvironment('APP_ENDPOINT');
  if (envValue) {
    return envValue;
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
  const envValue = getEnvironment('APP_DATA_DIR');
  if (envValue) {
    return path.resolve(envValue);
  }
  return path.resolve('./data/');
})();

const APP_PROXY_MODE = (() => {
  const envValue = getEnvironment('APP_PROXY_MODE');
  if (envValue) {
    return !/false|no|0/i.test(envValue);
  }
  return true;
})();

const APP_DRC_LOG_LEVEL = getEnvironment('APP_DRC_LOG_LEVEL') || 'warn';

const blobsDir = path.resolve(APP_DATA_DIR, 'blobs');

function getBlobsDir() {
  return blobsDir;
}

function getBlobFilePath(digest: string) {
  const [algo, hash] = digest.split(':', 2);
  return path.join(getBlobsDir(), algo, hash);
}

export default {
  APP_SUB_DOMAIN,
  APP_CONTEXT_PATH,
  APP_JWT_SECRET,
  APP_ALLOW_PUBLIC_PULL,
  APP_NEED_LOGIN,
  APP_DATA_DIR,
  APP_CONFIG_FILE,
  APP_PROXY_MODE,
  APP_DRC_LOG_LEVEL,
  config,
  login,
  getAppEndpoint,
  getSelfFullUrl,
  getHost,
  getBlobsDir,
  getBlobFilePath
};
