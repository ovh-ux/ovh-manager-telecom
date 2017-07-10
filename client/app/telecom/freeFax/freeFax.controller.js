angular.module("managerApp")
    .controller("FreeFaxCtrl", function ($q, $translate, $scope, FreeFax, $stateParams, Toast) {
        "use strict";
        var self = this;

        $scope.loading = true;
        this.serviceName = $stateParams.serviceName;

        function init () {
            FreeFax.Aapi().details({
                serviceName: self.serviceName
            }).$promise.then(function (freeFax) {
                $scope.freeFax = freeFax;
                return FreeFax.Lexi().voiceMailGetRouting({
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
