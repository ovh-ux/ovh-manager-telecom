(function () {
    "use strict";
    angular.module("managerApp").directive("functionParamaterUrl", function () {
        return {
            require: "ngModel",
            link: function (/* $scope, $elm, $attrs, $ctrl*/) {
                return true;
            }
        };
    });
})();
