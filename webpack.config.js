const merge = require('webpack-merge');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const _ = require('lodash');

/* eslint-disable import/no-unresolved, import/no-extraneous-dependencies */
const { config } = require('@ovh-ux/ovh-manager-webpack-toolkit')({
  template: path.resolve(__dirname, './client/index.html'),
  basePath: path.resolve(__dirname, './client'),
  lessPath: [
    path.resolve('./client/app'),
    path.resolve('./client/components'),
    path.resolve('./node_modules'),
  ],
  root: path.resolve(__dirname, './client/app'),
  assets: {
    files: [
      { from: path.resolve(__dirname, './client/app/common/assets'), to: 'assets' },
      { from: path.resolve(__dirname, './node_modules/angular-i18n'), to: 'angular-i18n' },
      { from: path.resolve(__dirname, './client/**/*.html'), context: 'client' },
    ],
  },
});
/* eslint-enable */

const folder = 'client/app/telecom';
const bundles = {};

fs.readdirSync('client/app/telecom').forEach((file) => {
  const stats = fs.lstatSync(`${folder}/${file}`);
  if (stats.isDirectory()) {
    const jsFiles = glob.sync(`${folder}/${file}/**/*.js`, { absolute: true });
    if (jsFiles.length > 0) {
      bundles[file] = jsFiles;
    }
  }
});

module.exports = merge(config, {
  entry: _.assign({
    main: path.resolve(__dirname, './client/app/index.js'),
    telecom: glob.sync('client/app/telecom/*.js', { absolute: true }),
    components: glob.sync('client/components/**/*.js', { absolute: true }),
    config: [path.resolve(__dirname, 'client/app/config/all.js'), path.resolve(__dirname, `client/app/config/${process.env.WEBPACK_SERVE ? 'dev' : 'prod'}.js`)],
  }, bundles),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
});
