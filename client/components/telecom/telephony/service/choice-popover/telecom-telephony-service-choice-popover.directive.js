angular.module("managerApp").directive("voipServiceChoicePopover", function ($compile) {
    "use strict";

    return {
        restrict: "A",
        controller: "voipServiceChoicePopoverCtrl",
        controllerAs: "$ctrl",
        bindToController: true,
        compile: function () {
            // need to use pre and post compile function to be abble to add popover attribute to element
            var curAttrContent;

            return {
                pre: function (tScope, tElement) {
                    // first remove attribute of directive (to avoid $compile to loop)
                    curAttrContent = tElement.attr("data-voip-service-choice-popover");
                    tElement.removeAttr("data-voip-service-choice-popover");
                },
                post: function (tScope, tElement, tAttributes, tCtrl) {
                    // add attribute to element to allow a popover on it
                    tElement.attr("data-responsive-popover", "'components/telecom/telephony/service/choice-popover/telecom-telephony-service-choice-popover.html'");
                    angular.forEach(tCtrl.popoverOptions, function (optionValue, key) {
                        var tmpAttrKey = "data-" + _.kebabCase(key);
                        if (key !== "popoverIsOpen") {
                            tElement.attr(tmpAttrKey, optionValue);
                        } else {
                            tElement.attr(tmpAttrKey, "$ctrl.popoverOptions.popoverIsOpen");
                        }
                    });

                    $compile(tElement)(tScope);
                    tElement.attr("data-voip-service-choice-popover", curAttrContent);
                }
            };
        },
        scope: {
            popoverOptions: "=voipServiceChoicePopover",
            availableTypes: "<?",
            hiddenGroups: "<?",
            onChoiceValidated: "&?",
            onChoiceCancel: "&?",
            choiceArgs: "<?",
            excludeServices: "<?"
        }
    };
});
