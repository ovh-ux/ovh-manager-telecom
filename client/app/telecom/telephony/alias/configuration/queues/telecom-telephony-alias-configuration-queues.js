angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.alias.configuration.queues", {
        url: "/queues",
        "abstract": true
    });
});
