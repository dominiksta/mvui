const path = require('path');

module.exports = {
  entry: './src/main.ts',
  output: {
    filename: 'script/main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    hot: true,
    static: path.resolve(__dirname, 'dist'),
    host: '127.0.0.1',
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        exclude: /node-modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
              ],
            },
          },
          'ts-loader'
        ]
      },
    ],
  },
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: [ '.js', '.ts' ],
  },
};
