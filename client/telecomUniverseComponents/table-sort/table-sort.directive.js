import _ from 'lodash';

export default () => ({
  restrict: 'A',
  scope: {
    tucTableSort: '&',
  },
  link(scope) {
    _.set(scope, '$parent.sort', {
      fieldName: null,
      descending: null,
    });
    _.set(scope, '$parent.tucTableSort', scope.tucTableSort);
  },
});
