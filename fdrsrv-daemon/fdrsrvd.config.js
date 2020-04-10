/** @type { IFdrsrvConfig } */
module.exports = {
  overrideEnvironments: {
    APP_SUB_DOMAIN: 'sub.private-docker-registry.io'
  },
  externalRegistries: {
    'docker.io': {
      endpoint: 'https://registry-1.docker.io'
    }
  }
};
