angular.module("managerApp").controller("PackInformationCtrl", function ($scope, $translate, $q, $stateParams, Toast, OvhApiPackXdsl, OvhApiXdsl, moment) {
    "use strict";

    var self = this;

    function getResiliationFollowUp () {
        return OvhApiPackXdsl.Lexi().resiliationFollowUp({
            packName: $stateParams.packName
        }).$promise.catch(function (err) {
            return err.status === 404 ? $q.when(null) : $q.reject(err);
        });
    }

    function getIsResiliationCancellable () {
        return OvhApiPackXdsl.Resiliation().Lexi().canCancelResiliation({
            packName: $stateParams.packName
        }, null).$promise.then(function (result) {
            return result.value;
        });
    }

    function getAssociatedLine () {
        return OvhApiPackXdsl.Access().Lexi().getServices({
            packId: $stateParams.packName
        }).$promise.then(function (access) {
            return OvhApiXdsl.Lines().Lexi().query({
                xdslId: _.first(access)
            }).$promise.then(function (lines) {
                return _.first(lines);
            });
        });
    }

    function init () {
        self.isLoading = true;
        return $q.all({
            followUp: getResiliationFollowUp(),
            cancellable: getIsResiliationCancellable(),
            associatedLine: getAssociatedLine()
        }).then(function (result) {
            self.resiliationFollowUp = result.followUp;
            self.isCancellable = result.cancellable;
            self.associatedLine = result.associatedLine;
            self.isEngaged = moment($scope.Pack.pack.informations.engagedUpTo).isAfter(moment());
        }).catch(function (err) {
            if (err.status !== 460 && err.status !== 403) {
                Toast.error([$translate.instant("pack_xdsl_oops_an_error_is_occured"), err.data ? err.data.message : ""].join(" "));
            }
            return $q.reject(err);
        }).finally(function () {
            self.isLoading = false;
        });
    }

    init();
});
