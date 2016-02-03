import {Router} from 'express';
import expressJwt from 'express-jwt';
import jwt from 'jsonwebtoken';
import {readFileSync} from 'fs';
import * as yggdrasil from '../minecraft/yggdrasil';
import bodyParser from 'body-parser';
import validator from 'express-validator';
import bluebird from 'bluebird';

bluebird.promisifyAll(jwt);

let router = Router();
let secret = readFileSync('./secret.key', {encoding: 'utf-8'});

router.use(bodyParser.json());
router.use(validator());
router.use(expressJwt({secret: secret}).unless({path: ['/api/login']}));

const list = params => {
  if (params.length === 1) {
    return params[0];
  }
  let last = params.pop();
  return `${params.join(', ')} and ${last}`;
}

class ValidationError extends Error {

  constructor(errors) {
    let params = list(errors.map(({param}) => param));
    super(`Invalid ${params}`);
    this.status = 400;
  }
}

const wrap = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

router.post('/login', wrap(async (req, res) => {
  req.checkBody('username').notEmpty();
  req.checkBody('password').notEmpty();
  let errors = req.validationErrors();
  if (errors) throw new ValidationError(errors);

  let {clientToken, accessToken, selectedProfile} =
    await yggdrasil.authenticate(req.body.username, req.body.password);

  let token = jwt.sign({clientToken, accessToken}, secret, {issuer: 'servercraft'});
  selectedProfile.token = token;
  res.json(selectedProfile);
}));

router.get('/token', (req, res) => res.json(req.user));

export default router;
