angular.module("managerApp").service("TelephonyVoipService", function ($q, OvhApiTelephony, TelephonyGroup, TelephonyGroupLine, TelephonyGroupNumber, TelephonyGroupFax) {
    "use strict";

    const self = this;

    /*
     * Fetch all telephony services and billing account using API V7
     */
    self.fetchAll = function () {
        const groups = {}; // indexed by billing accounts

        // fetch all billing accounts
        return OvhApiTelephony.v7().query().expand().execute().$promise.then(function (result) {

            _.forEach(result, function (item) {
                if (!item.error) { // how should we handle errors ?
                    const telephonyGroup = new TelephonyGroup(item.value);
                    groups[telephonyGroup.billingAccount] = telephonyGroup;
                }
            });

            // fetch all services
            return OvhApiTelephony.Service().v7().query().aggregate("billingAccount").expand().execute().$promise.then(function (aggragateResult) {

                // associate and create service to billing account
                _.forEach(aggragateResult, function (item) {
                    // extract billing account from path
                    const pathParts = item.path.split("/");
                    if (pathParts.length >= 2) {
                        const billingAccount = pathParts[2].toLowerCase();
                        const service = item.value;
                        service.billingAccount = billingAccount;

                        // create the service
                        if (service.featureType === "fax" || service.featureType === "voicefax") {
                            const fax = new TelephonyGroupFax(service);
                            groups[billingAccount].fax.push(fax);
                        } else {
                            switch (service.serviceType) {
                            case "line":
                                var line = new TelephonyGroupLine(service);
                                groups[billingAccount].lines.push(line);
                                break;
                            case "alias":
                                var number = new TelephonyGroupNumber(service);
                                groups[billingAccount].numbers.push(number);
                                break;
                            default:
                                break;
                            }
                        }
                    }
                });
                return groups;
            });
        });
    };
});
