angular.module('managerApp').filter('snakeCase', () => function (text) {
  return _.snakeCase(text);
});
