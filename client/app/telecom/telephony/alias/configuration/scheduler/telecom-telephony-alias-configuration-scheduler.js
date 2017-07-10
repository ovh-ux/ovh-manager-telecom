angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.alias.configuration.scheduler", {
        url: "/scheduler",
        "abstract": true
    });
});
