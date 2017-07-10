(function () {
    "use strict";

    angular.module("managerApp").component("telecomV4Links", {
        templateUrl: "components/telecom/v4-links/telecom-v4-links.html",
        bindings: {
            actions: "=telecomV4Links"
        },
        controller: function () {
            var self = this;

            self.actionRows = {
                main: null,
                normal: null
            };

            /*= =====================================
            =            INITIALIZATION            =
            ======================================*/

            // self.$onInit = function () {
            var mainActions = _.filter(self.actions, function (action) {
                return action.main && !action.divider;
            });

            self.actionRows.main = _.chunk(mainActions, 2);

            self.actionRows.normal = _.chain(self.actions).difference(mainActions).filter(function (action) {
                return !action.divider;
            }).chunk(3)
                .value();

            /* -----  End of INITIALIZATION  ------*/

        }
    });

})();
