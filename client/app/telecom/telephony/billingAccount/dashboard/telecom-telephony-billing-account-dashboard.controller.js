angular.module("managerApp")
    .controller("TelecomTelephonyBillingAccountDashboardCtrl", function ($translate, $scope, $stateParams, $state, $q, $window, $timeout,
                                                                         TelephonyMediator, OvhApiTelephony, ToastError, TelephonyGroupLinePhone, TELEPHONY_LINE_PHONE_ADDITIONAL_INFOS) {
        "use strict";

        var self = this;

        function isExpired () {
            if (self.group) {
                return self.group.status === "expired";
            }
            return true;
        }

        function getGroup () {
            return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
                self.group = group;
                self.phoneDetails.raw = self.group.lines;
                return self.group;
            }).catch(function (err) {
                if (err.status === 404) {
                    return $state.go("telecom.welcoming");
                }
                return new ToastError(err);
            });
        }

        function getPhonePicture (phone) {
            if (phone) {
                return TELEPHONY_LINE_PHONE_ADDITIONAL_INFOS[phone.brand] ? TELEPHONY_LINE_PHONE_ADDITIONAL_INFOS[phone.brand].icon : "ovh-font-phoneAlt";
            }
            return "ovh-font-lineCommunicating";

        }


        function fetchPhones (line) {
            self.loading.phones = true;

            return OvhApiTelephony.Line().Phone().v6().get({
                billingAccount: line.billingAccount,
                serviceName: line.serviceName
            }).$promise.then(function (phoneOpts) {

                line.phone = new TelephonyGroupLinePhone({
                    billingAccount: line.billingAccount,
                    serviceName: line.serviceName
                }, phoneOpts);

                line.hasPhone = true;

                return line.phone.getRMAs().then(function (RMAs) {
                    line.phone.RMAs = RMAs;
                    return line;
                }, function () {
                    line.phone.RMAs = [];
                    return line;
                });

            }, function () {
                line.hasPhone = false;
                line.RMAs = [];
                return line;
            });
        }

        function fetchPhonesDone (lines) {
            self.loading.phones = false;
            return lines;
        }

        function getPortability () {
            self.loading.portability = true;
            self.portabilities = 0;

            if (isExpired()) {
                self.loading.portability = false;
                return self.portability;
            }

            return OvhApiTelephony.Portability().v6().query({
                billingAccount: $stateParams.billingAccount
            }).$promise.then(function (ids) {
                self.portabilities = ids.length;
                return self.portabilities;
            }).catch(function (err) {
                return new ToastError(err);
            }).finally(function () {
                self.loading.portability = false;
            });
        }

        function getBill () {
            self.loading.bills = true;
            self.bills = [];

            if (isExpired()) {
                self.loading.bills = false;
                return self.bills;
            }

            return OvhApiTelephony.HistoryConsumption().v6().query({
                billingAccount: $stateParams.billingAccount
            }).$promise.then(function (ids) {
                return $q.all(_.map(_.slice(ids, ids.length - 5), function (chunkIds) {
                    return OvhApiTelephony.HistoryConsumption().v6().getBatch({
                        billingAccount: $stateParams.billingAccount,
                        date: chunkIds
                    }).$promise;
                })).then(function (chunkResult) {
                    var result = _.pluck(_.flatten(chunkResult), "value");
                    self.bills = _.each(result, function (consumption) {
                        consumption.priceValue = consumption.price ? consumption.price.value : null;
                    });
                    return self.bills;
                }).catch(function (err) {
                    return new ToastError(err);
                }).finally(function () {
                    self.loading.bills = false;
                });
            });
        }

        function getConsumption () {
            self.loading.consumption = true;

            self.consumption = [{
                label: "outgoing",
                count: 0
            }, {
                label: "incoming",
                count: 0
            }, {
                label: "transfer",
                count: 0
            }];

            if (isExpired()) {
                self.loading.consumption = false;
                return self.consumption;
            }

            return OvhApiTelephony.Service().VoiceConsumption().Aapi().get({
                billingAccount: $stateParams.billingAccount
            }).$promise.then(function (consumption) {
                if (self.group.lines && self.group.lines.length) {
                    self.consumption = [];

                    _.forEach(consumption.summary, function (count, type) {
                        if (type !== "total") {
                            self.consumption.push({
                                label: type,
                                count: count,
                                color: ""
                            });
                        }
                    });
                }

                return self.consumption;
            }).catch(function (err) {
                return new ToastError(err);
            }).finally(function () {
                self.loading.consumption = false;
                return self.consumption;
            });
        }

        function getFile (consumption, type) {
            var tryDownload = function () {
                return OvhApiTelephony.HistoryConsumption().v6().getFile({
                    billingAccount: $stateParams.billingAccount,
                    date: consumption.date,
                    extension: type
                }).$promise.then(function (info) {
                    if (info.status === "error") {
                        return $q.reject({
                            statusText: "Unable to download message"
                        });
                    } else if (info.status === "done") {
                        return $q.when(info);
                    }

                    // file is not ready to download, just retry
                    return $timeout(tryDownload, 1000);
                });
            };
            return tryDownload();
        }

        function download (consumption, type) {
            consumption.downloading = true;
            getFile(consumption, type).then(function (info) {
                $window.location.href = info.url;
            }).catch(function (err) {
                return new ToastError(err);
            }).finally(function () {
                consumption.downloading = false;
            });
        }

        /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

        this.$onInit = function () {

            self.loading = { };
            self.groupHasAtLeastOnePhone = false;

            self.download = download;
            self.getPhonePicture = getPhonePicture;
            self.fetchPhones = fetchPhones;
            self.fetchPhonesDone = fetchPhonesDone;
            $scope.itemsPerPage = 5;

            /** TODO implement filter*/
            self.phoneDetails = {
                raw: null,
                paginated: null/* ,
            sorted: null,
            orderBy: "",
            orderDesc: true*/
            };

            getGroup().then(function () {

                self.actions = [{
                    name: "telephony_group_admin_actions_order",
                    sref: "telecom.telephony.orderAlias",
                    disabled: isExpired(),
                    text: $translate.instant("telephony_group_billing_dashboard_actions_group_order")
                }, {
                    name: "telephony_group_admin_actions_bill",
                    sref: "telecom.telephony.billing.bill",
                    text: $translate.instant("telephony_group_billing_dashboard_go_to_my_bills")
                }, {
                    name: "telephony_group_admin_actions_delete",
                    sref: "telecom.telephony.deleteGroup",
                    disabled: isExpired(),
                    text: $translate.instant("telephony_group_billing_dashboard_actions_group_delete")
                }];

                return $q.all([
                    getPortability(),
                    getBill(),
                    getConsumption()
                ]);
            });

        };

        /* -----  End of INITIALIZATION  ------*/

        this.$onInit();

    });
