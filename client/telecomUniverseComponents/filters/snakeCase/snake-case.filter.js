import _ from 'lodash';

export default () => function (text) {
  return _.snakeCase(text);
};
