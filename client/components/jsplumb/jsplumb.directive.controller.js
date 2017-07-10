angular.module("managerApp").controller("jsplumbCtrl", function ($timeout) {
    "use strict";

    var self = this;
    var repaintTimeout = null;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    self.askForRepaint = function () {
        if (repaintTimeout) {
            $timeout.cancel(repaintTimeout);
        }

        repaintTimeout = $timeout(function () {
            self.instance.setSuspendDrawing(false, true);
        }, 150);
    };

    /* -----  End of HELPERS  ------*/

});
