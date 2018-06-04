angular.module('managerApp')
  .directive('tableSort', () => ({
    restrict: 'A',
    scope: {
      tableSort: '&',
    },
    link(scope) {
      _.set(scope, '$parent.sort', {
        fieldName: null,
        descending: null,
      });
      _.set(scope, '$parent.tableSort', scope.tableSort);
    },
  }))
  .component('colSort', {
    bindings: {
      fieldName: '@',
      title: '@',
      callback: '&',
    },
    controller($scope) {
      this.getSort = function () {
        $scope.$parent.sort = $scope.$parent.sort ? $scope.$parent.sort : {
          fieldName: null,
          descending: null,
        };
        return $scope.$parent.sort;
      };
      this.sortElement = function () {
        const sort = this.getSort();
        sort.descending = sort.fieldName !== this.fieldName ? false : !sort.descending;
        sort.fieldName = this.fieldName;
        if ($scope.$parent.tableSort) {
          $scope.$parent.tableSort({ SORT: sort });
        }
        this.callback({ SORT: sort });
      };
    },
    controllerAs: 'sortableCtrl',
    templateUrl: 'components/table-sort/table-sort.html',
    transclude: true,
  });
