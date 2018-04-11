/**
 * @ngdoc controller
 * @name managerApp.contoller:PromotionCodeCtrl
 * @description
 * Promotion Code controller
 */
angular.module("managerApp").controller("PromotionCodeCtrl", function ($scope, $rootScope, $stateParams, $translate, $uibModal, OvhApiPackXdslPromotionCode, ToastError) {
    "use strict";
    var self = this;

    $scope.$watch("service", function (val) {
        self.amount = val.data.amount;
        self.amount.engagement = val.data.engagement;
        self.proposal = $translate.instant("pack_promotion_code_proposal", self.amount);
    });

    /**
     * @ngdoc function
     * @name getPromotion
     * @methodOf managerApp.contoller:PromotionCodeCtrl
     * @description
     * Open a modal to re-engage the customer and generate the promotion code
     */
    this.getPromotion = function () {
        $uibModal
            .open({
                templateUrl: "app/telecom/pack/slots/promotionCode/pack-promotionCode.modal.html",
                resolve: {
                    data: function () {
                        return self.amount;
                    }
                },
                controllerAs: "ctrl",
                controller: function (data) {
                    this.condition = $translate.instant("pack_promotion_code_condition", data);
                }
            })
            .result.then(
                function () {
                    self.engageCustomer();
                }
            );
    };

    /**
     * @ngdoc function
     * @name range
     * @methodOf managerApp.contoller:PromotionCodeCtrl
     * @description
     * Launch the re-engagement of the customer
     */
    this.engageCustomer = function () {
        OvhApiPackXdslPromotionCode.v6().generate(
            {
                packId: $stateParams.packName
            }, null).$promise.then(function () {
                $rootScope.$broadcast("reload-frames");
            }, ToastError
        );
    };

});
