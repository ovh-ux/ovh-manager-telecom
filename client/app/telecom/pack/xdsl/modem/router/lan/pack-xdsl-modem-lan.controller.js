angular.module("managerApp").controller("XdslModemLanCtrl", function ($stateParams, $translate, OvhApiXdsl, PackXdslModemLanObject, validator, $q, Toast, PackXdslModemMediator) {
    "use strict";

    var self = this;

    this.validator = validator;
    this.mediator = PackXdslModemMediator;

    /**
     * submit / unsubmit with keys
     * @param                  {Event} $event AngularJs Event
     * @param {PackXdslModemLanObject} lan    lan to update
     * @param                {Boolean} valid  Form valid ?
     */
    this.watchKey = function ($event, lan, valid) {
        if ($event.keyCode === 13 && valid) {
            self.submit(lan);
        }
        if ($event.keyCode === 27) {
            lan.cancel();
        }
    };

    /**
     * Submit a LAN
     * @param {PackXdslModemLanObject} lan LAN to update
     * @return {Promise}
     */
    this.submit = function (lan) {
        return lan.save($stateParams.serviceName);
    };

    function init () {
        self.loader = true;
        return OvhApiXdsl.Modem().Lan().Aapi().getLanDetails(
            {
                xdslId: $stateParams.serviceName
            }
        ).$promise.then(
            function (data) {
                self.lans = _.map(data, function (elt) {
                    return new PackXdslModemLanObject(elt);
                });
            }
        ).catch(function (err) {
            Toast.error($translate.instant("xdsl_modem_lan_error"));
            return $q.reject(err);
        }).finally(function () {
            self.loader = false;
        });
    }

    init();
});
