angular.module("managerApp").service("OverTheBoxMediator", function (OverTheBox) {
    "use strict";

    var self = this;

    /*= ============================
    =            COUNT            =
    =============================*/

    self.getCount = function () {
        return OverTheBox.Lexi().query().$promise.then(function (otbIds) {
            return otbIds.length;
        });
    };

    /* -----  End of COUNT  ------*/

});
