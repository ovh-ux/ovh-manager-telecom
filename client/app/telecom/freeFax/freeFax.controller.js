angular.module("managerApp")
    .controller("FreeFaxCtrl", function ($q, $translate, $scope, OvhApiFreeFax, $stateParams, Toast) {
        "use strict";
        var self = this;

        $scope.loading = true;
        this.serviceName = $stateParams.serviceName;

        function init () {
            OvhApiFreeFax.Aapi().details({
                serviceName: self.serviceName
            }).$promise.then(function (freeFax) {
                $scope.freeFax = freeFax;
                return OvhApiFreeFax.v6().voiceMailGetRouting({
                    serviceName: self.serviceName
                }).$promise.then(function (voiceMail) {
                    $scope.freeFax.voicemailActive = voiceMail.value === "voicemail";
                    return $scope.freeFax;
                });
            }).catch(function (err) {
                if (err.status === 460) {
                    self.error = $translate.instant("freefax_expired_error");
                } else {
                    Toast.error($translate.instant("freefax_detail_error"));
                }
                return $q.reject(err);
            }).finally(function () {
                $scope.loading = false;
            });
        }

        init();
    });
