import * as express from 'express';
import * as expressJwt from 'express-jwt';

import appEnv from '../../app-env';

const router = express.Router();

router.use(expressJwt({
  secret: appEnv.APP_JWT_SECRET,
    credentialsRequired: false
}));
router.use(function (req: express.Request, res: express.Response, next: any) {
    if(!appEnv.APP_NEED_LOGIN && (!(req as any).user)) {
        (req as any).user = {
            jti: '*anonymous',
            user_id: 'anonymous'
        };
    }
    next();
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res
      .status(200)
      .send({});
});

const imagePathExpr = '*';
const digestExpr = '(([A-Za-z0-9_+.-]+):([A-Fa-f0-9]+))$';

router.use(function (req: express.Request, res: express.Response, next: any) {
    if(appEnv.APP_SUB_DOMAIN && req.hostname.endsWith(appEnv.APP_SUB_DOMAIN)) {
        req.query.registry = req.hostname.substring(0, req.hostname.length - appEnv.APP_SUB_DOMAIN.length - 1);
    }
    next();
});

router.get(`/:name(${imagePathExpr})/tags/list`, require('./image/tags/get-list').default);
router.head(`/:name(${imagePathExpr})/manifests/:reference`, require('./image/manifests/head-by-reference').default);
router.get(`/:name(${imagePathExpr})/manifests/:reference`, require('./image/manifests/get-by-reference').default);
router.put(`/:name(${imagePathExpr})/manifests/:reference`, require('./image/manifests/put-by-reference').default);
router.delete(`/:name(${imagePathExpr})/manifests/:reference`, require('./image/manifests/delete-by-reference').default);
router.head(`/:name(${imagePathExpr})/blobs/:digest(${digestExpr})`, require('./image/blobs/head-by-digest').default);
router.get(`/:name(${imagePathExpr})/blobs/:digest(${digestExpr})`, require('./image/blobs/get-by-digest').default);
router.delete(`/:name(${imagePathExpr})/blobs/:digest(${digestExpr})`, require('./image/blobs/delete-by-digest').default);
router.post(`/:name(${imagePathExpr})/blobs/uploads/`, require('./image/blobs/uploads/post-index').default);
router.get(`/:name(${imagePathExpr})/blobs/uploads/:uuid`, require('./image/blobs/uploads/get-by-uuid').default);
router.patch(`/:name(${imagePathExpr})/blobs/uploads/:uuid`, require('./image/blobs/uploads/patch-by-uuid').default);
router.put(`/:name(${imagePathExpr})/blobs/uploads/:uuid`, require('./image/blobs/uploads/put-by-uuid').default);
router.delete(`/:name(${imagePathExpr})/blobs/uploads/:uuid`, require('./image/blobs/uploads/delete-by-uuid').default);
router.get('/_catalog', require('./get-catalog').default);

export default router;
