'use strict'

process.env.BABEL_ENV = 'main'

const path = require('path')
const webpack = require('webpack')
const fs = require('fs');
const packageJSON = require('../package.json');

const nodeModules = {};
fs.readdirSync('../node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

let cliConfig = {
  entry: {
    account: path.join(__dirname, '../src/account/index.js'),
    monitor: path.join(__dirname, '../src/monitor/index.js'),
    strategy: path.join(__dirname, '../src/strategy/index.js')
  },
  externals: {
    ...nodeModules,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.node$/,
        use: 'node-loader'
      }
    ]
  },
  node: {
    __dirname: process.env.NODE_ENV !== 'production',
    __filename: process.env.NODE_ENV !== 'production'
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '../dist')
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin()
  ],
  resolve: {
    alias: {
      '@': path.join(__dirname, '../../app/src/renderer'),
      '__gUtils': path.join(__dirname, '../../app/src/utils'),
      '__gConfig': path.join(__dirname, '../../app/src/config')
    },
    extensions: ['.js', '.json', '.node']
  }
}

cliConfig.plugins.push(
  new webpack.DefinePlugin({
    'process.env.APP_TYPE': '"cli"',
    '_version_': packageJSON.version
  })
)

/**
 * Adjust cliConfig for development settings
 */
if (process.env.NODE_ENV !== 'production') {
  cliConfig.plugins.push(
    new webpack.DefinePlugin({
      '__resources': `"${path.join(__dirname, '../resources').replace(/\\/g, '\\\\')}"`
    })
  )
}

/**
 * Adjust cliConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
  cliConfig.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
    })
  )
}


module.exports = cliConfig