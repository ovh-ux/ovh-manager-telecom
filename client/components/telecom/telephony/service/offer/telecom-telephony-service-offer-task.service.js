angular.module("managerApp").service("voipServiceOfferTask", function (Poller) {
    "use strict";

    var self = this;

    self.startPolling = function (billingAccount, serviceName, taskId, pollOptions) {
        return Poller.poll(["/telephony", billingAccount, "service", serviceName, "offerTask", taskId].join("/"), {
            cache: false
        }, pollOptions);
    };

    self.stopPolling = function (pollingNamespage) {
        return Poller.kill({
            namespace: pollingNamespage
        });
    };
});
