angular.module("managerApp").directive("inputFile", function () {
    "use strict";

    return {
        restrict: "E",
        transclude: true,
        scope: {
            ngModel: "=",
            ngAccept: "@",
            ngAcceptFilter: "&",
            change: "&"
        },
        templateUrl: "components/input-file/input-file.html",
        link: function (scope, element, attrs, controller) {
            if (attrs.hasOwnProperty("ngAcceptFilter")) {
                controller.hasNgAcceptFilter = true;
            }
        },
        controller: function ($scope, $element, $timeout) {

            $scope.selected = false;
            var self = this;

            var fileInput = $element.find("input");

            $scope.$watch("ngModel", function () {
                if ($scope.ngModel && $scope.ngModel.name && !$scope.selected) {
                    $timeout(function () {
                        $scope.selected = true;
                    });
                } else if (!$scope.ngModel) {
                    $timeout(function () {
                        $scope.selected = false;
                    });
                }
            });

            fileInput.bind("change", function () {
                $timeout(function () {
                    var file = fileInput[0].files[0];
                    if (!self.hasNgAcceptFilter || (file && $scope.ngAcceptFilter({ file: file }))) {
                        $scope.selected = true;
                        $timeout(function () {
                            $scope.ngModel = file;
                        });
                    }
                    $scope.change({ file: file });
                });
            });

            $scope.clearFile = function () {
                $scope.selected = false;
                $timeout(function () {
                    $scope.ngModel = null;
                    fileInput.val("");
                    $scope.change({ file: null });
                });
            };
        }
    };
});
