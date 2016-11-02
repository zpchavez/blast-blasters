var appBase = './game'
var __PORT__ = 9123;

var path = require('path');
var request = require('request');
var webpack = require('webpack');
var webpackConfig = require('./webpack.config');
var proxy = require('express-http-proxy');
var express = require('express');
var url = require('url');

var app = express();
var compiler = webpack(webpackConfig);
var publicPath = webpackConfig[0].output.publicPath;

app.use(require('webpack-dev-middleware')(compiler, {
  publicPath: publicPath,
  contentBase: path.resolve(__dirname, 'build/' + appBase.path),
  hot: true,
  quiet: false,
  noInfo: false,
  lazy: false,
  stats: true,
}));

app.use(require('webpack-hot-middleware')(compiler));

app.use(function (req, res, next) {
  var urlPath = url.parse(req.url).pathname;
  var ext = path.extname(urlPath);

  if ((ext === '' || ext === '.html') && req.url !== '/') {
    req.pipe(request('http://' + req.hostname + ':' + __PORT__)).pipe(res);
  } else {
    next();
  }
});

app.listen(__PORT__, function (err, result) {
  if (err) {
    console.log(err);
    return null;
  }

  console.log('Listening at localhost:' + __PORT__);
});
