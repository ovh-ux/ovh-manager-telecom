import _ from 'lodash';

export default () => function (str) {
  return _.snakeCase(str);
};
