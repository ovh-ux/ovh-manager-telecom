angular.module("managerApp").factory("VoipServiceAlias", function (VoipService) {
    "use strict";

    class VoipServiceAlias extends VoipService {
        constructor (options = {}) {
            super(options);
        }
    }

    return VoipServiceAlias;

});
