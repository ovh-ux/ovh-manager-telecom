angular.module("managerApp").service("OverTheBoxMediator", function (OvhApiOverTheBox) {
    "use strict";

    var self = this;

    /*= ============================
    =            COUNT            =
    =============================*/

    self.getCount = function () {
        return OvhApiOverTheBox.Lexi().query().$promise.then(function (otbIds) {
            return otbIds.length;
        });
    };

    /* -----  End of COUNT  ------*/

});
