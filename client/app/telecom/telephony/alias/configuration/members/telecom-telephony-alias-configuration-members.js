angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.alias.configuration.members", {
        url: "/members",
        "abstract": true
    });
});
