import bluebird from 'bluebird';
import bodyParser from 'body-parser';
import createDebug from 'debug';
import {Router} from 'express';
import jwt from 'express-jwt';
import validator from 'express-validator';
import {readFileSync} from 'fs';
import path from 'path';

import {User, AccessKey} from '../db';
import {wrap, ValidationError} from '../utils';
import {getVersions} from '../minecraft/versions';
import * as yggdrasil from '../minecraft/yggdrasil';

bluebird.promisifyAll(jwt);

let debug = createDebug('servercraft:api');
let router = Router();
let secret = readFileSync(path.resolve(__dirname, '../../secret.key'), {encoding: 'utf-8'});

router.use(bodyParser.json());
router.use(validator());

router.use(jwt({
  secret: secret,
  getToken(req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
      let t = req.query.token;
      req.query.token = undefined;
      return t;
    } else if (req.body && req.body.token) {
      let t = req.body.token;
      req.body.token = undefined;
      return t;
    }
    return null;
  }
}).unless({path: ['/api/login']}));

// POST /api/login {username: string, password: string}
// Take a users mojang login details and return a token and some user data
router.post('/login', wrap(async (req, res) => {
  req.checkBody('username').notEmpty();
  req.checkBody('password').notEmpty();
  let errors = req.validationErrors();
  if (errors) throw new ValidationError(errors);

  // Try and authenticate with Mojang. They'll send us tokens, and info about the user.
  let {clientToken, accessToken, selectedProfile} =
    await yggdrasil.authenticate(req.body.username, req.body.password);

  let user;
  // If we've seen this user before ...
  if (await User.exists(selectedProfile.id)) {
    // ... update our info on them with Mojang's ...
    user = await User
      .forge({id: selectedProfile.id})
      .save({name: selectedProfile.name, displayName: selectedProfile.name}, {patch: true});
  } else {
    // ... otherwise, create a new user from the mojang data.
    user = await User
      .forge({id: selectedProfile.id, name: selectedProfile.name, displayName: selectedProfile.name})
      .save(null, {method: 'insert'});
  }
  user = await user.fetch();
  debug('login', {clientToken, user: user.get('name')});

  // Save our access key in the database.
  let key = await AccessKey.forge({id: accessToken, userId: user.id}).save(null, {method: 'insert'});

  // generate a jwt for the user.
  let token = key.getToken(clientToken, secret);
  res.json({token, user: user.toJSON()});
}));

// POST /api/token {token: JWT}
// Validate a token and return the associated user data
router.post('/token', wrap(async (req, res) => {
  // Check with the mojang auth server that the tokens are still valid. Mojand might give us new tokens
  let {accessToken, clientToken} = await yggdrasil.validate(req.user.accessToken, req.user.clientToken);

  // Grab our old key+user relation from the db
  let accessKey = await AccessKey.forge({id: req.user.accessToken}).fetch({withRelated: 'user'});
  let user = accessKey.related('user');

  // If mojang has sent us updates tokens...
  if (accessToken !== req.user.accessToken || clientToken !== req.user.clientToken) {
    debug('validate:new token', {clientToken, user: user.get('name')});

    // ... forget the old one ...
    await accessKey.destroy();

    // ... and save the new one
    accessKey = await AccessKey.forge({
      id: accessToken,
      userId: user.id
    }).save(null, {method: 'insert'});
  } else {
    debug('validate token', {clientToken, user: user.get('name')});
  }

  // Generate a JWT - itll be the same as the old one unless the keys changed
  let token = accessKey.getToken(clientToken, secret);
  res.json({token, user: user.toJSON()});
}));

// POST /api/logout {token: JWT}
// Invalidate a user token
router.post('/logout', wrap(async (req, res) => {
  // Invalidate the token with Mojang
  await yggdrasil.invalidate(req.user.accessToken, req.user.clientToken);

  // Delete our copy of the key in the DB:
  await AccessKey.forge({id: req.user.accessToken}).destroy();

  // That's it!
  debug('invalidate token', {clientToken: req.user.clientToken});
  res.json({invalidated: true});
}));

router.get('/versions', wrap(async (req, res) => {
  res.json(await getVersions());
}));

export default router;
