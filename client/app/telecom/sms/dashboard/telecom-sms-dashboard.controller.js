angular.module("managerApp").controller("TelecomSmsDashboardCtrl", function ($stateParams, $q, $translate, Sms, SmsMediator, ToastError) {
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

    function fetchOutgoing (month) {
        return Sms.Outgoing().Lexi().query({
            serviceName: $stateParams.serviceName,
            "creationDatetime.from": moment().subtract(month || 0, "months").startOf("month").format(),
            "creationDatetime.to": moment().subtract(month || 0, "months").endOf("month").format()
        }).$promise;
    }

    function fetchIncoming (month) {
        return Sms.Incoming().Lexi().query({
            serviceName: $stateParams.serviceName,
            "creationDatetime.from": moment().subtract(month || 0, "months").startOf("month").format(),
            "creationDatetime.to": moment().subtract(month || 0, "months").endOf("month").format()
        }).$promise;
    }

    function fetchJobs () {
        return Sms.Jobs().Lexi().query({
            serviceName: $stateParams.serviceName
        }).$promise;
    }

    function getPreviousMonths () {
        var monthsAvailable = [];
        for (var i = 1; i <= self.stats.limit; i++) {
            monthsAvailable.push({
                index: self.stats.moment.month - i,
                name: _.capitalize(moment().month(self.stats.moment.month - i).format("MMMM")),
                fromYear: moment().month(self.stats.moment.month - i).format("YYYY")
            });
        }
        return monthsAvailable;
    }

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.getStats = function (sender) {
        self.loading.stats = true;
        Sms.Outgoing().Lexi().resetAllCache();
        Sms.Incoming().Lexi().resetAllCache();
        var offset = self.stats.moment.month - (self.stats.filter.month ? self.stats.filter.month : moment().month());
        return $q.all({
            outgoing: fetchOutgoing(offset),
            incoming: fetchIncoming(offset)
        }).then(function (results) {
            if (sender) {
                return $q.all(_.map(_.chunk(results.outgoing, 50), function (chunkIds) {
                    return Sms.Outgoing().Lexi().getBatch({
                        serviceName: $stateParams.serviceName,
                        id: chunkIds
                    }).$promise.catch(function (err) {
                        return new ToastError(err);
                    });
                })).then(function (chunkResult) {
                    return _.pluck(_.flatten(chunkResult), "value");
                }).then(function (sms) {
                    self.stats.data.outgoing = _.filter(sms, { sender: sender }).length;
                    self.stats.data.incoming = 0;
                }).catch(function (err) {
                    return new ToastError(err);
                });
            }
            self.stats.data.outgoing = results.outgoing.length;
            self.stats.data.incoming = results.incoming.length;
            return null;
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loading.stats = false;
        });
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading = {
            init: false,
            stats: false
        };

        self.service = null;

        self.actions = [
            {
                name: "compose_message",
                sref: "telecom.sms.sms.compose",
                text: $translate.instant("sms_actions_send_sms")
            }, {
                name: "recredit_options",
                sref: "telecom.sms.order",
                text: $translate.instant("sms_actions_credit_account")
            }, {
                name: "manage_recipient_new",
                sref: "telecom.sms.receivers",
                text: $translate.instant("sms_actions_create_contact")
            }, {
                name: "manage_senders",
                sref: "telecom.sms.senders.add",
                text: $translate.instant("sms_actions_create_sender")
            }, {
                name: "manage_soapi_users",
                sref: "telecom.sms.users",
                text: $translate.instant("sms_actions_create_api_user")
            }, {
                name: "manage_blacklisted_senders",
                sref: "telecom.sms.receivers",
                text: $translate.instant("sms_actions_clean_contact_list")
            }
        ];

        self.stats = {
            moment: {
                year: moment().year(),
                month: moment().month()
            },
            label: {
                months: [],
                senders: []
            },
            filter: {
                sender: null,
                month: null
            },
            data: {
                outgoing: null,
                incoming: null,
                jobs: null
            },
            limit: 6
        };

        self.loading.init = true;
        Sms.Outgoing().Lexi().resetAllCache();
        Sms.Incoming().Lexi().resetAllCache();
        return $q.all({
            senders: fetchSenders(),
            outgoing: fetchOutgoing(),
            incoming: fetchIncoming(),
            jobs: fetchJobs()
        }).then(function (results) {
            self.stats.data.outgoing = results.outgoing.length;
            self.stats.data.incoming = results.incoming.length;
            self.stats.data.jobs = results.jobs.length;
            self.stats.label.senders = results.senders;
            self.stats.label.months = getPreviousMonths();
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.service = SmsMediator.getCurrentSmsService();
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
