const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: './src/main.ts',
  devServer: {
    hot: true,
    static: path.join(__dirname, 'dist'),
    host: '127.0.0.1',
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node-modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.js', '.ts' ],
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist', 'script'),
  },
};
