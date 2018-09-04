const merge = require('webpack-merge');
const path = require('path');
const fs = require('fs');

function getEntries(startPath, filter) {
  if (!fs.existsSync(startPath)) {
    return [];
  }

  const files = fs.readdirSync(startPath);
  let found = [];

  files.forEach((filename) => {
    const filePath = path.resolve(startPath, filename);
    const stat = fs.lstatSync(filePath);

    if (stat.isDirectory()) {
      found = found.concat(getEntries(filePath, filter));
    } else if (filter.test(filename) && filename.search('.spec.') < 0 && filename.search('.mock.') < 0) {
      found.push(path.resolve(startPath, filename));
    }
  });

  return found;
}

/* eslint-disable import/no-unresolved, import/no-extraneous-dependencies */
const { config } = require('@ovh-ux/ovh-manager-webpack-toolkit')({
  template: path.resolve(__dirname, './client/webpack.html'),
  basePath: path.resolve(__dirname, './client'),
  lessPath: [
    path.resolve('./client/app'),
    path.resolve('./client/components'),
    path.resolve('./node_modules'),
  ],
  root: path.resolve(__dirname, './client/app'),
});
/* eslint-enable */

module.exports = merge(config, {
  entry: {
    main: path.resolve(__dirname, './client/app/index.js'),
    telecom: getEntries(path.resolve(__dirname, 'client/app/telecom'), /\.js$/),
    config: [path.resolve(__dirname, 'client/app/config/all.js'), path.resolve(__dirname, 'client/app/config/dev.js')],
    components: getEntries(path.resolve(__dirname, 'client/components'), /\.js$/),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
});
