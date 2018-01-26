angular.module("managerApp").controller("TelecomOrdersCtrl", function (OvhApiXdslOrderFollowup, ToastError, ORDER_STATUS, PAGINATION_PER_PAGE) {
    "use strict";

    const self = this;

    self.ordersDetails = [];
    self.orders = [];
    self.perPage = PAGINATION_PER_PAGE;
    self.currentPage = 0;

    /*= =============================
    =            EVENTS            =
    ==============================*/

    self.onTransformItemNotify = function (item) {
        self.ordersDetails.push(item);
    };

    /* -----  End of EVENTS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    this.$onInit = function () {
        self.loading = true;
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

            // paginate
            self.ordersDetails = self.orders.slice(0, self.perPage);
            self.loading = false;
        }, function (err) {
            self.loading = false;
            return new ToastError(err);
        });
    };

    /* -----  End of INITIALIZATION  ------*/
});
