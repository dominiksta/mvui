const path = require('path');
const webpack = require('webpack');

/**
   This webpack config is currently only required for cypress tests. The actual
   compilation is (for now, maybe that will change at some point) done directly by
   tsc. The reason why we dont need webpack or another bundler in the core is because it
   is meant to be used as a library and therefore the bundling can be done by the
   downstream packages using it.
 */

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    hot: true,
    host: '127.0.0.1',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
      {
        test: /\.ts$/,
        exclude: /node-modules/,
        use: 'ts-loader'
      },
    ],
  },
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: [ '.js', '.ts' ],
    alias: {
      '$thispkg': path.resolve(__dirname, 'src')
    }
  },
};
