angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.alias.configuration.stats", {
        url: "/stats",
        "abstract": true
    });
});
