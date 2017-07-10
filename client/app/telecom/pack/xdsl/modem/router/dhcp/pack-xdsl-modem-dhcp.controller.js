angular.module("managerApp").controller("XdslModemDhcpCtrl", function ($stateParams, PackXdslModemDhcpObject, Xdsl, $q, $translate, Toast, validator, PackXdslModemMediator) {
    "use strict";

    var self = this;
    this.validator = validator;
    this.mediator = PackXdslModemMediator;

    /**
     * submit / unsubmit with keys
     * @param                   {Event} $event AngularJs Event
     * @param {PackXdslModemDhcpObject} dhcp   dhcp to update
     * @param                 {Boolean} valid  Form valid ?
     */
    this.watchKey = function ($event, dhcp, valid) {
        if ($event.keyCode === 13 && valid) {
            self.submit(dhcp);
        }
        if ($event.keyCode === 27) {
            dhcp.cancel();
        }
    };

    /**
     * Submit a DHCP
     * @param {PackXdslModemDhcpObject} lan LAN to update
     * @return {Promise}
     */
    this.submit = function (dhcp) {
        return dhcp.save($stateParams.serviceName);
    };

    this.isIpInOrder = function (ip1Param, ip2Param) {
        var ip1 = ip1Param;
        var ip2 = ip2Param;
        ip1 = _.map(ip1.split(/\./), function (elt) {
            return parseInt(elt, 10);
        });
        ip2 = _.map(ip2.split(/\./), function (elt) {
            return parseInt(elt, 10);
        });
        var comp = _.reduce(ip1, function (result, val, index) {
            return result && (val <= ip2[index]);
        });

        return comp && _.last(ip1) < _.last(ip2);
    };

    function init () {
        self.loader = true;
        return Xdsl.Modem().Lan().Dhcp().Aapi().query(
            {
                xdslId: $stateParams.serviceName
            }
        ).$promise.then(
            function (data) {
                self.dhcps = _.map(data, function (elt) {
                    return new PackXdslModemDhcpObject(elt);
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
