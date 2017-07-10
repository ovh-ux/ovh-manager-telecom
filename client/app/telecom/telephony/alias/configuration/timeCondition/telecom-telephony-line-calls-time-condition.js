angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.alias.configuration.timeCondition", {
        url: "/timeCondition",
        "abstract": true
    });

});
