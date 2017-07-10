angular.module("managerApp").directive("removeAutocomplete", function () {
    "use strict";
    return {
        restrict: "A",
        link: function (scope, el) {
            el.bind("change", function (e) {
                e.preventDefault();
            });
        }
    };
});
