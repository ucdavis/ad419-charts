const path = require('path');
// `CheckerPlugin` is optional. Use it if you want async error reporting.
// We need this plugin to detect a `--watch` mode. It may be removed later
// after https://github.com/webpack/webpack/issues/3460 will be resolved.
const { ProvidePlugin } = require('webpack');
const { CheckerPlugin } = require('awesome-typescript-loader')
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const assets = [
];

module.exports = {
 
  entry: {
    'app': './src/public/js/app.ts',
    'sankey': './src/public/js/sankey.ts',
    'map': './src/public/js/map.ts'
  },

  output: {
    path: path.join(__dirname, './dist/public'),
    filename: 'js/[name].js',
    publicPath: '/',
  },

  // Currently we need to add '.ts' to the resolve.extensions array.
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      jquery: "jquery/src/jquery"
    }
  },
 
  // Source maps support ('inline-source-map' also works)
  devtool: 'source-map',
 
  // Add the loader for .ts files.
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader'
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          use: [{
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              minimize: true,
              sourceMap: true,
            }
          }, {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
            }
          }, {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            }
          }]
        })
      },
      {
        test: /\.(png|jpg|svg)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8192,
            mimetype: 'image/png',
            fallback: {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]?[hash]',
                outputPath: 'media/images/'
              }
            }
          }
        }]
      },
      {
        test: /\.(woff|woff2)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]?[hash]',
            outputPath: 'media/fonts/'
          }
        }]
      }
    ]
  },
  plugins: [
    new CheckerPlugin(),
    new ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    }),
    new CopyWebpackPlugin(
      assets.map(a => {
        return {
          from: path.resolve(__dirname, `./node_modules/${a}`),
          to: path.resolve(__dirname, './dist/lib')
        };
      })
    ),
    new CopyWebpackPlugin([
      { from: path.resolve(__dirname, './src/public') },
    ]),
    new ExtractTextPlugin({
      filename: 'css/[name].css'
    }),
  ]
};