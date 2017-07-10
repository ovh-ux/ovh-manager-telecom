(function () {
    "use strict";

    angular.module("managerApp").component("linePhoneConfigurationUserInterface", {
        require: {
            configForm: "^form"
        },
        bindings: {
            configGroup: "=linePhoneConfigurationGroup",
            editMode: "=linePhoneConfigurationEditMode",
            expertMode: "=linePhoneConfigurationExpertMode"
        },
        templateUrl: "components/telecom/telephony/group/line/phone/configration/userInterface/line-phone-configuration-user-interface.html",
        controller: function () {

            var self = this;

            self.screenPages = [];
            self.fakeConfigGroup = null;
            self.currentScreenPage = 0;

            /*= ==============================
            =            HELPERS            =
            ===============================*/

            self.getKeyIndex = function (index) {
                return {
                    number: index + (self.currentScreenPage * self.configGroup.keysPerScreen) + 1
                };
            };

            /* -----  End of HELPERS  ------*/

            /*= =====================================
            =            INITIALIZATION            =
            ======================================*/

            self.$onInit = function () {
                var keys = _.filter(self.configGroup.configs, function (config) {
                    return _.startsWith(config.name, "KeyLabel");
                }).sort(function (configA, configB) {
                    var matchA = parseInt(configA.name.match(/\d+/g)[0], 10);
                    var matchB = parseInt(configB.name.match(/\d+/g)[0], 10);

                    if (matchA < matchB) {
                        return -1;
                    } else if (matchA > matchB) {
                        return 1;
                    }
                    return 0;
                });
                self.screenPages = _.chunk(keys, self.configGroup.keysPerScreen);

                // build fake config group if some
                if (keys.length < self.configGroup.configs.length) {
                    self.fakeConfigGroup = {
                        name: [self.configGroup.name, "fake"].join("-"),
                        configs: _.filter(self.configGroup.configs, function (config) {
                            return !_.startsWith(config.name, "KeyLabel");
                        })
                    };
                    self.fakeConfigGroup.isExpertOnly = _.every(self.fakeConfigGroup.configs, {
                        level: "expert"
                    });
                }
            };

            /* -----  End of INITIALIZATION  ------*/

        }
    });

})();
