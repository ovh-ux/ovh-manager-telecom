angular.module("managerApp")
    .controller("XdslDeconsolidationCtrl", function (
        $scope,
        $state,
        $timeout,
        $translate,
        OvhApiXdsl,
        Toast,
        $uibModal,
        ToastError,
        REDIRECT_URLS,
        OvhApiPackXdsl,
        validator,
        $stateParams) {
        "use strict";

        var self = this;

        this.isLegacyOffer = null;
        this.model = {
            validDeconso: false,
            rio: null
        };
        this.rioCodeIsValid = false;

        this.openConfirmModal = function () {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: "app/telecom/pack/xdsl/access/deconsolidation/contract/pack-xdsl-access-deconsolidation-contract.modal.html",
                controller: "XdslDeconsolidationContractCtrl",
                controllerAs: "XdslDeconsolidationContract",
                resolve: {
                    data: function () {
                        return {
                            rio: self.model.rio,
                            serviceName: $scope.access.xdsl.accessName
                        };
                    }
                }
            });
            modal.result.then(function (result) {
                if (result.status === "todo" || result.status === "doing") {
                    $scope.access.tasks.current[result.function] = true;
                }
                Toast.success($translate.instant("xdsl_access_deconsolidation_success"));
                $timeout(function () {
                    $state.go("telecom.pack.xdsl");
                }, 3000);
            });
        };

        this.getOldV6TransfertUrl = function () {
            return REDIRECT_URLS.oldV6ServiceTransfert;
        };

        this.checkRioCode = function () {
            this.rioCodeIsValid = validator.isRio(self.model.rio, $stateParams.number);
        };

        function updateIsLegacyOffer () {
            return OvhApiPackXdsl.v6().get({
                packId: $stateParams.packName
            }).$promise.then(
                function (data) {
                    self.isLegacyOffer = data.capabilities.isLegacyOffer;
                },
                ToastError);
        }

        function init () {
            self.loading = true;
            updateIsLegacyOffer().finally(function () {
                self.loading = false;
            });
        }

        init();
    });
