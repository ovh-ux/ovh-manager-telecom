import VoipBillingAccount from "./billingAccount/telecom-voip-billing-account";

angular.module("managerApp").service(
    "voipTest",
    class {
        test () {
            this.t = new VoipBillingAccount();
        }
    }
);
