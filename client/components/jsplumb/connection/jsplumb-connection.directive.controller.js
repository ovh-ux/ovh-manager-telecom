angular.module("managerApp").controller("jsplumbConnectionCtrl", function () {
    "use strict";

    var self = this;

    self.connection = null;

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    /**
     *  Directive initialization
     */
    self.$onInit = function () {
        if (!self.target) {
            throw new Error("target options must be specified when instanciating a jsplumb connection.");
        }
    };

    /* -----  End of INITIALIZATION  ------*/


});
