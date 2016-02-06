import errorHandler from 'api-error-handler';
import {createServer} from 'http';
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import serveStatic from 'serve-static';

import attachApi from './api';

let app = express();
let server = createServer(app);

app.use(morgan('short'));

const publicPath = path.join(__dirname, 'public');
const staticDev = (app) => {
  let config = require('../webpack.config.js'),
      webpack = require('webpack')(config);

  app.use(require('webpack-dev-middleware')(webpack, {publicPath: '/'}));

  app.use(require('webpack-hot-middleware')(webpack));
}

const staticProduction = (app) => {
  app.use(serveStatic(publicPath));
}

if (process.env.NODE_ENV !== 'production') {
  staticDev(app);
} else {
  staticProduction(app);
}

attachApi(app, server);
app.use(errorHandler());

server.listen(process.env.PORT || 3000);
