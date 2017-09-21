angular.module("managerApp").controller("XdslModemDhcpBdhcpCtrl", function ($stateParams, $translate, Toast, validator, PackXdslModemDhcpBdhcpObject, OvhApiXdsl, $q, PackXdslModemMediator) {
    "use strict";

    var self = this;

    this.validator = validator;
    this.mediator = PackXdslModemMediator;

    /**
     * submit / unsubmit with keys
     */
    this.watchKey = function ($event, bdhcp, valid) {
        if ($event.keyCode === 13 && valid) {
            self.update(bdhcp);
        }
        if ($event.keyCode === 27) {
            this.cancel(bdhcp);
        }
    };

    /**
     * Cancel the edition of a BDHCP
     * @param {PackXdslModemDhcpBdhcpObject} bdhcp Static Address Description
     */
    this.cancel = function (bdhcp) {
        if (!bdhcp.cancel()) {
            _.remove(self.bdhcps, bdhcp);
        }
    };

    /**
     * Update a BDHCP
     * @param {PackXdslModemDhcpBdhcpObject} bdhcp Static Address Description
     * @return {Promise}
     */
    this.update = function (bdhcp) {
        return bdhcp.save($stateParams.serviceName, self.lanName, self.dhcpName);
    };

    /**
     * Add a BDHCP
     */
    this.add = function () {
        var newBdhcp = new PackXdslModemDhcpBdhcpObject();
        self.bdhcps.push(newBdhcp);
        newBdhcp.edit();
    };

    /**
     * Delete a BDHCP
     * @param {PackXdslModemDhcpBdhcpObject} bdhcp Static Address Description
     * @return {Promise}
     */
    this.delete = function (bdhcp) {
        return bdhcp.remove($stateParams.serviceName, self.lanName, self.dhcpName).then(function (deletedBdhcp) {
            _.remove(self.bdhcps, deletedBdhcp);
        });
    };

    function getDhcp () {
        return OvhApiXdsl.Modem().Lan().Dhcp().Aapi().query(
            {
                xdslId: $stateParams.serviceName
            }
        ).$promise.then(
            function (data) {
                if (_.isArray(data) && data.length) {
                    return _.head(data);
                }
                return $q.reject("No DHCP found");
            }
        );
    }

    function init () {
        self.loader = true;
        getDhcp().then(
            function (dhcp) {
                self.lanName = dhcp.lanName;
                self.dhcpName = dhcp.dhcpName;
                self.bdhcps = _.map(dhcp.bdhcp, function (elt) {
                    var bdhcp = new PackXdslModemDhcpBdhcpObject(elt);
                    bdhcp.inApi();
                    return bdhcp;
                });
            }
        ).catch(function (err) {
            Toast.error($translate.instant("xdsl_modem_dhcp_error"));
            return $q.reject(err);
        }).finally(function () {
            self.loader = false;
        });
    }

    init();
});
