angular.module("managerApp").controller("TelecomTelephonyAliasConfigurationRecordsEasyHuntingCtrl", function ($q, $stateParams, TelephonyMediator, Telephony, ToastError) {
    "use strict";

    var self = this;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    self.fetchQueues = function () {
        return Telephony.EasyHunting().Hunting().Queue().Lexi()
            .query({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName
            }).$promise.then(function (ids) {
                return $q.all(_.map(ids, function (id) {
                    return Telephony.EasyHunting().Hunting().Queue().Lexi()
                        .get({
                            billingAccount: $stateParams.billingAccount,
                            serviceName: $stateParams.serviceName,
                            queueId: id
                        }).$promise;
                }));
            });
    };

    self.fetchRecords = function () {
        Telephony.EasyHunting().Records().Lexi().resetAllCache();
        return Telephony.EasyHunting().Records().Lexi().query({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function (recordsIds) {
            return $q.all(_.map(_.chunk(recordsIds, 50), function (chunkIds) {
                return Telephony.EasyHunting().Records().Lexi().getBatch({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName,
                    id: chunkIds
                }).$promise;
            })).then(function (chunkResult) {
                return _.pluck(_.flatten(chunkResult), "value");
            });
        });
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.updateQueue = function (queue) {
        var attrs = ["record", "askForRecordDisabling", "recordDisablingLanguage", "recordDisablingDigit"];
        return Telephony.EasyHunting().Hunting().Queue().Lexi()
            .change({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName,
                queueId: _.get(queue, "queueId")
            }, _.pick(queue, attrs)).$promise;
    };

    self.deleteSelectedRecords = function (records) {
        return $q.all(_.map(records, function (record) {
            return Telephony.EasyHunting().Records().Lexi().remove({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName,
                id: record.id
            }).$promise;
        }));
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.isLoading = true;
        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.number = group.getNumber($stateParams.serviceName);
            return self.number.feature.init().then(function () {
                if (self.number.getFeatureFamily() === "easyHunting") {
                    self.recordsApi = {
                        fetchQueues: self.fetchQueues,
                        updateQueue: self.updateQueue,
                        fetchRecords: self.fetchRecords,
                        deleteSelectedRecords: self.deleteSelectedRecords
                    };
                }
            });
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isLoading = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
