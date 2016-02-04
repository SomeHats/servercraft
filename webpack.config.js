var path = require('path'),
  webpack = require('webpack'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  ExtractTextPlugin = require('extract-text-webpack-plugin');

// This is a dirty hack, but it gives a ~35% reduction in CSS file size so ¯\_(ツ)_/¯
function hackCssIdents() {
  var module = require('module');
  var originalGetLocalIdent = require('css-loader/lib/getLocalIdent');
  module._cache[require.resolve('css-loader/lib/getLocalIdent')].exports = getLocalIdent;

  var count = 0, cache = {}, alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  function encode(value) {
    var base = alphabet.length;
    if (value < base) return alphabet[value];
    return encode(Math.floor(value / base)) + alphabet[value % base];
  }

  function getLocalIdent(loaderContext, localIdentName, localName, options) {
    var ident = originalGetLocalIdent(loaderContext, localIdentName, localName, options);
    if (cache[ident]) {
      return cache[ident];
    }
    return cache[ident] = encode(count++);
  }
}

function getConfig() {
  var isDev = process.env.NODE_ENV !== 'production';

  if (!isDev) hackCssIdents();
  var cssLoader = [
    'css?modules&localIdentName=[path]-[name]--[local]',
    'sass',
    'toolbox'
  ].join('!');

  var name = isDev ? '[name]' : '[name].[hash]';

  var config = {
    entry: [
      './client/helpers/plugins.js',
      './client/index.js',
      './client/styles/common.scss'
    ],
    output: {
      path: path.join(__dirname, 'dist/public/'),
      filename: name + '.js'
    },
    debug: isDev,
    resolve: {
      extensions: ['', '.js', '.jsx', '.scss']
    },
    module: {
      loaders: [{
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel'
      }, {
        test: /\.scss$/,
        loader: isDev ? 'style!' + cssLoader
                      : ExtractTextPlugin.extract('style', cssLoader)
      }]
    },
    toolbox: {theme: './client/styles/theme.scss'},
    plugins: [
      new HtmlWebpackPlugin({
        template: './client/index.html',
        inject: true
      })
    ]
  };

  if (isDev) {
    config.devtool = 'inline-source-map';

    // Hot reloading:
    config.plugins.push(new webpack.optimize.OccurenceOrderPlugin());
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
    config.plugins.push(new webpack.NoErrorsPlugin());
    config.entry.push('webpack-hot-middleware/client');
  } else {
    config.plugins.push(new ExtractTextPlugin(name + '.css'));
  }

  return config;
}

module.exports = getConfig();
