angular.module("managerApp")
    .directive("tableSort", function () {
        "use strict";
        return {
            restrict: "A",
            scope: {
                tableSort: "&"
            },
            link: function (scope) {
                scope.$parent.sort = {
                    fieldName: null,
                    descending: null
                };
                scope.$parent.tableSort = scope.tableSort;
            }
        };
    })
    .component("colSort", {
        bindings: {
            fieldName: "@",
            title: "@",
            callback: "&"
        },
        controller: function ($scope) {
            "use strict";
            this.getSort = function () {
                $scope.$parent.sort = $scope.$parent.sort ? $scope.$parent.sort : {
                    fieldName: null,
                    descending: null
                };
                return $scope.$parent.sort;
            };
            this.sortElement = function () {
                var sort = this.getSort();
                sort.descending = sort.fieldName !== this.fieldName ? false : !sort.descending;
                sort.fieldName = this.fieldName;
                if ($scope.$parent.tableSort) {
                    $scope.$parent.tableSort({ SORT: sort });
                }
                this.callback({ SORT: sort });
            };
        },
        controllerAs: "sortableCtrl",
        templateUrl: "components/table-sort/table-sort.html",
        transclude: true
    });
