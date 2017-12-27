angular.module("managerApp").factory("VoipLineFeature", function (VoipFeature) {
    "use strict";

    class VoipLineFeature extends VoipFeature {
        constructor (options = {}) {
            // set parent options
            super(options);

            // set VoipLineFeature options (from API)
            this.setOptions(options);
        }

        setOptions (featureOptions) {
            this.notifications = featureOptions.notifications;

            // if notifications logs is not setted. Set it to defaults
            if (_.isNull(_.get(this.notifications, "logs"))) {
                _.set(this.notifications, "logs", {
                    email: null,
                    frequency: "Never",
                    sendIfNull: false
                });
            }
        }
    }

    return VoipLineFeature;

});
