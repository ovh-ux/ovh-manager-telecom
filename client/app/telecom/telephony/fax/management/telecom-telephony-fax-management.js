angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.fax.management", {
        url: "/management",
        "abstract": true,
        translations: [
            "common",
            "telecom/telephony/fax"
        ]
    });
});
