(function () {
    "use strict";

    angular.module("managerApp").component("errorDrawingCross", {
        templateUrl: "components/errorDrawingCross/errorDrawingCross.html",
        bindings: {
            drawErrorCross: "<"
        },
        transclude: true
    });

})();
