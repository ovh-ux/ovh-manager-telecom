angular.module("managerApp").directive("fileReader", function () {
    "use strict";

    return {
        restrict: "E",
        transclude: true,
        bindToController: true,
        scope: {
            ngAccept: "@",
            ngAcceptFilter: "&",
            ngRead: "&"
        },
        templateUrl: "components/file-reader/file-reader.html",
        controller: function ($element, $attrs, $window, $timeout) {
            var fileInput = $element.find("input");
            var self = this;

            self.hasFileReader = angular.isDefined($window.FileReader);

            if (self.hasFileReader) {
                fileInput.bind("change", function () {
                    var file = fileInput[0].files[0];
                    fileInput[0].value = null; // reset

                    if (file) {
                        var isAcceptedFile = true;

                        if (angular.isDefined($attrs.ngAcceptFilter)) {
                            isAcceptedFile = self.ngAcceptFilter({ file: file });
                        }

                        if (isAcceptedFile) {
                            var reader = new $window.FileReader();
                            reader.onload = function () {
                                $timeout(function () {
                                    if (angular.isDefined($attrs.ngRead)) {
                                        self.ngRead({ data: reader.result });
                                    }
                                });
                            };
                            reader.readAsText(file);
                        }
                    }
                });
            }
        },
        controllerAs: "ctrl"
    };
});
