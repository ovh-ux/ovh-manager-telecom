angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.alias.configuration.agents", {
        url: "/agents",
        "abstract": true
    });
});
