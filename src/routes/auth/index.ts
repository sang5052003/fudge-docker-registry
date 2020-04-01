import * as express from 'express';
import * as validator from 'express-validator';

const router = express.Router();

router.get('/token', [
    validator.header('authorization')
        .matches(/(basic [A-Za-z0-9/+=]+|)/i)
        .withMessage('unknown authorization header')
], require('./get-token').default);

export default router;
