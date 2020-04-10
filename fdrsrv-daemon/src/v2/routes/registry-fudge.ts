import * as express from 'express';

export function getLocalImageName(params: {
  registry?: string,
  name: string
}) {
  if (params.registry) {
    return `${params.registry}/${params.name}`;
  }
  return params.name;
}

export function getImageName(req: express.Request) {
  if (req.query.registry) {
    return `${req.query.registry}/${req.params.name}`;
  }
  return req.params.name;
}

export default null;
