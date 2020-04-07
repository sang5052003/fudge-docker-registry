const path = require('path');

module.exports = {
  mode: 'production',
  target: 'node',
  entry: {
    main: './src/entry.ts'
  },
  output: {
    filename: 'bundle.js',
    path: process.env.BUNDLE_JS_DIR ? path.resolve(process.env.BUNDLE_JS_DIR) : path.resolve(__dirname, 'dist')
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      'sqlite3': path.resolve(__dirname, './libraries/sqlite3.js'),
      '@src': path.resolve(__dirname, './src/')
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  'targets': {
                    'node': 'current'
                  }
                }
              ],
              '@babel/preset-typescript'
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-transform-classes',
              // '@babel/plugin-transform-runtime'
            ]
          }
        }
      }
    ]
  },
  optimization: {
    minimize: false
  }
};
