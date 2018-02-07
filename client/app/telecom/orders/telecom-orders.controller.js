angular.module("managerApp").controller("TelecomOrdersCtrl", function (OvhApiXdslOrderFollowup, ToastError, ORDER_STATUS, PAGINATION_PER_PAGE) {
    "use strict";

    var self = this;

    self.ordersDetails = null;
    self.orders = [];
    self.perPage = PAGINATION_PER_PAGE;

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    self.$onInit = function () {
        OvhApiXdslOrderFollowup.Aapi().query().$promise.then(function (result) {
            self.orders = result;

            result.forEach(function (access) {
                if (access.lastTask) {
                    access.badgeClass = ORDER_STATUS[access.lastTask.status].class;
                    access.badgeIconClass = ORDER_STATUS[access.lastTask.status].icon;
                    access.priority = ORDER_STATUS[access.lastTask.status].priority;
                }
                access.name = access.description ? access.description : access.xdsl;
            });

            // sort: first ERROR, then TODO, then DOING, then DONE
            self.orders = _.sortByOrder(self.orders, ["priority"], ["desc"]);
            self.ordersDetails = self.orders;
        }, function (err) {
            return new ToastError(err);
        });
    };

    /* -----  End of INITIALIZATION  ------*/
});
