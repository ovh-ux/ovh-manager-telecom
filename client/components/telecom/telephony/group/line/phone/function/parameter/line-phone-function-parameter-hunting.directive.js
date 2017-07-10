(function () {
    "use strict";
    angular.module("managerApp").directive("functionParamaterHunting", function () {
        return {
            require: "ngModel",
            link: function (/* $scope, $elm, $attrs, $ctrl*/) {
                return true;
            }
        };
    });
})();
