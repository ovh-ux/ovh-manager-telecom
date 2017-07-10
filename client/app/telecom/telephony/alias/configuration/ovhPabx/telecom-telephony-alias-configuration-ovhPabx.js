angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.alias.configuration.ovhPabx", {
        url: "/ovhPabx",
        "abstract": true,
        translations: ["common", "telecom/telephony/alias/configuration/ovhPabx"]
    });
});
