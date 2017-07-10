angular.module("managerApp").service("FaxMediator", function (FreeFax) {
    "use strict";

    var self = this;

    /*= ============================
    =            COUNT            =
    =============================*/

    self.getCount = function () {
        return FreeFax.Erika().query().execute().$promise.then(function (freeFaxIds) {
            return freeFaxIds.length;
        });
    };

    /* -----  End of COUNT  ------*/

});
