var Webpack = require('webpack');
var WebpackError = require('webpack-error-notification');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

var npmPath = path.resolve(__dirname, 'node_modules');
var appFolder = './src';
var buildPath = path.resolve(__dirname, 'build');
var environment = (process.env.APP_ENV || 'development');
var __HOSTNAME__ = 'localhost';
var __PORT__ = 9123;

var config = {
  devtools: [],
  entries: {
    app: [
        'babel-polyfill',
        appFolder + '/main.js',
        (environment === 'development') ?
            'webpack-hot-middleware/client?path=/__webpack_hmr?http://' + __HOSTNAME__ + ':' + __PORT__ :
            null
    ]
  },
  plugins: [
    new Webpack.optimize.OccurrenceOrderPlugin(),
    new Webpack.optimize.DedupePlugin(),
    new HtmlWebpackPlugin({
      template: appFolder + '/index.html',
      inject: false
    }),
  ],
};

config.devtools = '#inline-source-map';

if (environment === 'development') {
  config.plugins.push(
    new Webpack.HotModuleReplacementPlugin(),
    new Webpack.NoErrorsPlugin(),
    new WebpackError(process.platform),
    new CopyWebpackPlugin([
        {
            from: npmPath + '/phaser/build/phaser.min.js',
            to: buildPath + '/lib/phaser.min.js',
        }
    ])
  );
}

module.exports = [{
  name: 'app bundle',
  entry: config.entries.app,
  output: {
    filename: 'app.js',
    path: buildPath,
    publicPath: '/',
  },
  module: {
    loaders: [
      {
        test: /\.(eot|ico|ttf|woff|woff2|gif|jpe?g|png|svg)$/,
        loader: 'file-loader',
        exclude: npmPath,
      },
      {
        test: /\.jsx?$/,
        loaders: ['babel'],
        exclude: npmPath,
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
        exclude: npmPath,
      },
    ],
  },
  plugins: config.plugins,

  resolve: {
    alias: {
      base: path.resolve('./'),
    },
    extensions: ['', '.css', '.js', '.json', '.jsx', '.scss', '.webpack.js', '.web.js'],
  },
  devtool: config.devtools,
}];
