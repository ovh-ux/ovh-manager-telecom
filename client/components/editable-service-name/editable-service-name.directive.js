angular.module("managerApp").directive("editableServiceName", function ($timeout) {
    "use strict";

    return {
        restrict: "E",
        templateUrl: "components/editable-service-name/editable-service-name.html",
        scope: {
            title: "=editableServiceNameTitle",
            serviceName: "=editableServiceNameServiceName",
            onEditStart: "&?editableServiceNameTitleOnEditStart",
            onEditCancel: "&?editableServiceNameTitleOnEditCancel",
            onSave: "&editableServiceNameTitleOnSave", // MUST BE a promise
            maxlength: "@",
            disabled: "="
        },
        bindToController: true,
        controllerAs: "$ctrl",
        controller: "EditableServiceNameCtrl",
        link: function ($scope, $element, attributes, editableServiceNameCtrl) {
            $scope.$watch("$ctrl.inEdition", function (isInEdition) {
                if (isInEdition) {
                    $timeout(function () {
                        $element.find("input.service-name-edit-input").select();
                    });
                }
            });

            $element.on("keydown blur", "input.service-name-edit-input", function (event) {
                if (event.type === "keydown") {
                    if (event.keyCode === 27) { // if ESC is pressed
                        editableServiceNameCtrl.cancelEdition();
                        $scope.$apply();
                    }
                } else if (event.type === "focusout") { // this is the blur event
                    // As event.relatedTarget is not implemented in all browser we can use document.activeElement with a timeout to know if we have to hide or not input.
                    // see http://stackoverflow.com/questions/22879572/javascript-focusout-get-the-element-that-receives-focus for more explain.
                    $timeout(function () {
                        if (!document.activeElement || (document.activeElement && !$(document.activeElement).is("button.btn-editable"))) {
                            editableServiceNameCtrl.cancelEdition();
                        }
                    });

                }
            });

            $scope.$on("$destroy", function () {
                $element.off("keydown");
            });
        }
    };
});
