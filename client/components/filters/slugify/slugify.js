angular.module('managerApp').filter('slugify', () => function (str) {
  return _.snakeCase(str);
});
