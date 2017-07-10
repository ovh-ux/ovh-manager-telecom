angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.alias.configuration.callsFiltering", {
        url: "/callsFiltering",
        "abstract": true
    });
});
