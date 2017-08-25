import VoipBillingAccount from "./telecom-voip-billing-account";

angular.module("managerApp").service(
    "voipBillingAccount",
    class {
        test () {
            this.t = new VoipBillingAccount();
        }
    }
);
