angular.module("managerApp")
    .component("packMoveAddressFuture", {
        bindings: {
            address: "=?",
            addressLoading: "=?",
            rio: "=?",
            keepLineNumber: "=?",
            lineNumber: "@",
            canKeepLineNumber: "=?"
        },
        templateUrl: "app/telecom/pack/move/address/future/pack-move-address-future.html",
        controllerAs: "PackMoveAddressFuture",
        controller: function (validator) {
            "use strict";
            this.validator = validator;
        }
    });
