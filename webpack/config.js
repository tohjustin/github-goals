const path = require('path');

module.exports = {
  entry: {
    background: './src/js/background',
    popup: './src/js/popup'
  },
  output: {
    filename: './js/[name].js'
  },
  resolve: {
    modules: [
      __dirname,
      'src',
      'src/js',
      'node_modules'
    ]
  },
  module: {
    rules: [{
      test: /\.js$/,
      loaders: ['babel-loader'],
      include: path.resolve(__dirname, '../src/js')
    },
    {
      test: /\.scss$/,
      use: [{
        loader: 'style-loader'
      }, {
        loader: 'css-loader'
      }, {
        loader: 'sass-loader'
      }],
      include: path.resolve(__dirname, '../src/styles')
    }]
  }
};
