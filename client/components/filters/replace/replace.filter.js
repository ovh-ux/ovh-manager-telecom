angular.module('managerApp').filter('replace', () => function (str, from, to) {
  return (`${str}`).replace(from, to);
});

