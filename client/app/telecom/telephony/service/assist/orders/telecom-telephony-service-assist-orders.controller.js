angular.module("managerApp").controller("TelecomTelephonyServiceAssistOrdersCtrl", function ($filter, $q, $translate, $stateParams, OvhApiTelephony, OvhApiMeOrder, TelephonyMediator) {
    "use strict";

    var self = this;
    self.service = null;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function fetchOrders () {
        return OvhApiTelephony.v6().getCurrentOrderIds().$promise.then(function (orderIds) {
            return OvhApiMeOrder.v7().query().addFilter("orderId", "in", orderIds).expand().execute().$promise.then(function (orders) {
                return $q.all(_.map(_.pluck(orders, "value"), function (order) {
                    return OvhApiMeOrder.v6().getStatus({
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
        self.ordersRaw = null;

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function () {
            self.service = TelephonyMediator.findService($stateParams.serviceName);

            return fetchOrders().then(function (orders) {
                self.ordersRaw = orders;
            });
        });
    };

    /* -----  End of INITIALIZATION  ------*/

});
