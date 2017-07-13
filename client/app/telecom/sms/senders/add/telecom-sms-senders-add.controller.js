angular.module("managerApp").controller("TelecomSmsSendersAddCtrl", function ($q, $stateParams, $translate, $state, $timeout, Sms, Toast, ToastError) {
    "use strict";

    var self = this;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function fetchSenders () {
        return Sms.Senders().Lexi().query({
            serviceName: $stateParams.serviceName
        }).$promise;
    }

    function fetchSendersAvailableForValidation () {
        return Sms.Lexi().getSendersAvailableForValidation({
            serviceName: $stateParams.serviceName
        }).$promise;
    }

    self.getSelection = function () {
        var allSelectedSenders = _.union(self.senders.availableForValidation.nichandle, self.senders.availableForValidation.domains);
        return _.filter(allSelectedSenders, function (sender) {
            return self.senders.availableForValidation.selected && self.senders.availableForValidation.selected[sender.sender];
        });
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.addSenderAvailable = function (sender) {
        self.loading.adding = true;

        return Sms.Senders().Lexi().create({
            serviceName: $stateParams.serviceName
        }, {
            sender: sender.sender,
            reason: "sendersAvailableForValidation"
        }).$promise.then(function () {
            Toast.success($translate.instant("sms_senders_add_sender_added"));
            return $state.go("telecom.sms.senders");
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loading.adding = false;
        });
    };

    self.add = function () {
        self.loading.adding = true;

        return Sms.Senders().Lexi().create({
            serviceName: $stateParams.serviceName
        }, {
            sender: self.sender.sender,
            description: self.sender.description,
            reason: self.sender.reason
        }).$promise.then(function () {
            return $state.go("telecom.sms.senders");
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loading.adding = false;
        });
    };

    self.addSelectedSendersAvailableForValidaton = function () {
        var sendersAvailableForValidaton = self.getSelection();
        var queries = sendersAvailableForValidaton.map(function (sender) {
            return Sms.Senders().Lexi().create({
                serviceName: $stateParams.serviceName
            }, {
                sender: sender.sender,
                reason: "sendersAvailableForValidation"
            }).$promise;
        });
        self.loading.adding = true;
        queries.push($timeout(angular.noop, 500)); // avoid clipping
        Toast.info($translate.instant("sms_senders_add_senders_success"));
        return $q.all(queries).then(function () {
            self.senders.availableForValidation.selected = {};
            return $state.go("telecom.sms.senders");
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loading.adding = false;
        });
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading = {
            init: false,
            adding: false
        };

        self.sender = {};

        self.senders = {
            pattern: /^[\w\s\-.,&+]+$/,
            availableForValidation: {
                domains: [],
                nichandle: [],
                selected: {}
            }
        };

        self.sendersAvailableForValidation = null;

        self.choice = "manual";

        self.loading.init = true;
        return $q.all({
            senders: fetchSenders(),
            sendersAvailableForValidation: fetchSendersAvailableForValidation()
        })
            .then(function (results) {
                self.sendersAvailableForValidation = results.sendersAvailableForValidation;
                return $q.all(_.map(results.senders, function (sender) {
                    return Sms.Senders().Lexi().get({
                        serviceName: $stateParams.serviceName,
                        sender: sender
                    }).$promise;
                }));
            })
            .then(function (senders) {
                self.senders.availableForValidation.domains = _.filter(self.sendersAvailableForValidation, { referer: "domain" });
                self.senders.availableForValidation.domains = _.filter(self.senders.availableForValidation.domains, function (domain) {
                    return !_.find(senders, { sender: domain.sender });
                });

                self.senders.availableForValidation.nichandle = _.uniq(_.filter(self.sendersAvailableForValidation, { referer: "nichandle" }), "sender");
                self.senders.availableForValidation.nichandle = _.filter(self.senders.availableForValidation.nichandle, function (nichandle) {
                    return !_.find(senders, { sender: nichandle.sender });
                });
            })
            .catch(function (err) {
                return new ToastError(err);
            })
            .finally(function () {
                self.loading.init = false;
            });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
