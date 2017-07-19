angular.module("managerApp").controller("TelecomTelephonyServiceAssistOrdersCtrl", function ($filter, $q, $translate, $stateParams, OvhApiTelephony, OvhApiMeOrder, TelephonyMediator) {
    "use strict";

    var self = this;

    self.service = null;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function fetchOrders () {
        return OvhApiTelephony.Lexi().getCurrentOrderIds().$promise.then(function (orderIds) {
            return OvhApiMeOrder.Erika().query().addFilter("orderId", "in", orderIds).expand().execute().$promise.then(function (orders) {
                return $q.all(_.map(_.pluck(orders, "value"), function (order) {
                    return OvhApiMeOrder.Lexi().getStatus({
                        orderId: order.orderId
                    }).$promise.then(function (status) {
                        order.statusText = $translate.instant("telephony_line_assist_orders_order_status_" + _.snakeCase(status.status));
                        return order;
                    });
                }));
            });
        });
    }

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.applySorting = function () {
        var data = angular.copy(self.orders.raw);
        data = $filter("orderBy")(
            data,
            self.orders.orderBy,
            self.orders.orderDesc
        );
        self.orders.sorted = data;
    };

    self.orderBy = function (by) {
        if (self.orders.orderBy === by) {
            self.orders.orderDesc = !self.orders.orderDesc;
        } else {
            self.orders.orderBy = by;
        }
        self.applySorting();
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.orders = {
            raw: null,
            sorted: null,
            paginated: null,
            isLoading: false,
            orderBy: "date",
            orderDesc: true
        };
        self.orders.isLoading = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function () {
            self.service = TelephonyMediator.findService($stateParams.serviceName);

            return fetchOrders().then(function (orders) {
                self.orders.raw = orders;
                self.applySorting();
            });
        }).finally(function () {
            self.orders.isLoading = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
