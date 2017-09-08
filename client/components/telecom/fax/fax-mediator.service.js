angular.module("managerApp").service("FaxMediator", function (OvhApiFreeFax) {
    "use strict";

    var self = this;

    /*= ============================
    =            COUNT            =
    =============================*/

    self.getCount = function () {
        return OvhApiFreeFax.Erika().query().execute().$promise.then(function (freeFaxIds) {
            return freeFaxIds.length;
        });
    };

    /* -----  End of COUNT  ------*/

});
