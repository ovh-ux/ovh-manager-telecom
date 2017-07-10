angular.module("managerApp").directive("telephonyNumberOvhPabxSoundUploader", function () {
    "use strict";

    return {
        restrict: "A",
        transclude: true,
        require: ["^^?telephonyNumber", "^^?telephonyNumberOvhPabx", "telephonyNumberOvhPabxSoundUploader"],
        template: "<div data-ng-transclude></div><input type=\"file\" accept=\"audio/*\" data-input-file-change=\"$ctrl.onSoundFileChoosed\" />",
        controllerAs: "$ctrl",
        scope: {
            ovhPabx: "=?",
            file: "=ngModel",
            $errors: "=uploadErrors"
        },
        bindToController: true,
        controller: "telephonyNumberOvhPabxSoundUploaderCtrl",
        link: function (tScope, tElement, tAttributes, controllers) {

            /*= =====================================
            =            INITIALZIATION            =
            ======================================*/

            function init () {
                // check for tag name
                if (tElement.get(0).tagName !== "LABEL") {
                    throw new Error("Please set telephonyNumberOvhPabxSoundUploader on a label tag");
                }

                // set controllers
                var soundUploaderCtrl = controllers[2];
                soundUploaderCtrl.numberCtrl = controllers[0];
                soundUploaderCtrl.ovhPabxCtrl = controllers[1];

                // check for required parents or attributes
                if (!soundUploaderCtrl.numberCtrl && !soundUploaderCtrl.ovhPabx) {
                    throw new Error("telephonyNumberOvhPabxSoundUploader must have telephonyNumber component as parent or must have ovhPabx attribute specified");
                }

                if (!soundUploaderCtrl.ovhPabx) {
                    soundUploaderCtrl.ovhPabx = soundUploaderCtrl.numberCtrl.number.feature;
                }
            }

            /* -----  End of INITIALZIATION  ------*/

            init();
        }
    };
});
