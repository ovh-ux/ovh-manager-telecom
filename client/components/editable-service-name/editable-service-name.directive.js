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
                }
            });

            $scope.$on("$destroy", function () {
                $element.off("keydown");
            });
        }
    };
});
