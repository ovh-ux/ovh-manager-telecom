angular.module("managerApp").controller("TelecomTelephonyServiceAssistOrdersCtrl", function ($filter, $q, $translate, $stateParams, OvhApiTelephony, OvhApiMeOrder, TelephonyMediator) {
    "use strict";

    const self = this;

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

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    self.$onInit = function () {
        self.orders = {
            raw: null
        };

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function () {
            self.service = TelephonyMediator.findService($stateParams.serviceName);

            return fetchOrders().then(function (orders) {
                self.orders.raw = orders;
            });
        });
    };

    /* -----  End of INITIALIZATION  ------*/

});
