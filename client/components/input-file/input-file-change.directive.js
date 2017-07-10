angular.module("managerApp").directive("inputFileChange", function () {
    "use strict";

    return {
        restrict: "A",
        scope: {
            change: "&inputFileChange"
        },
        link: function (tScope, tElement) {
            tElement.bind("change", function () {
                tScope.$apply(function () {
                    var file = tElement.get(0).files[0];
                    if (file) {
                        tScope.change()(file);
                    }
                });
            });
        }
    };

});
