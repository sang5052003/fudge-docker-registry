export declare type LoginFunction = (username: string, password: string) => Promise<boolean> | boolean;

export declare interface IExternalRegistryInfo {
  endpoint?: string;
  username?: string;
  password?: string;
}

export declare interface IEnvironments {
  APP_SUB_DOMAIN: string;
  APP_CONTEXT_PATH: string;
  APP_JWT_SECRET: string;
  APP_ALLOW_PUBLIC_PULL: string;
  APP_NEED_LOGIN: string;
  APP_DATA_DIR: string;
  APP_CONFIG_FILE: string;
  APP_PROXY_MODE: string;
  [key: string]: string;
}

export declare interface IFdrsrvConfig {
  overrideEnvironments?: IEnvironments;
  login?: LoginFunction;
  externalRegistries?: Record<string, IExternalRegistryInfo>;
}
