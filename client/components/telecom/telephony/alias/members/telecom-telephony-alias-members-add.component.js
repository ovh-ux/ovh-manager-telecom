angular.module("managerApp").component("telecomTelephonyAliasMembersAdd", {
    bindings: {
        api: "="
    },
    templateUrl: "components/telecom/telephony/alias/members/telecom-telephony-alias-members-add.html",
    controller: function ($q, $translate, $translatePartialLoader, $uibModal, Toast, ToastError) {
        "use strict";

        var self = this;

        self.$onInit = function () {

            self.addMemberForm = {
                numbers: [null],
                options: {}
            };

            self.loaders = {
                adding: false
            };

            // list of already added services
            self.servicesToExclude = [];

            // forms
            self.resetMemberAddForm();

            $translatePartialLoader.addPart("../components/telecom/telephony/alias/members");
            return $translate.refresh().finally(function () {
                self.isInitialized = true;
                return self.refreshMembers().catch(function (err) {
                    return new ToastError(err);
                });
            });
        };

        self.onChooseServicePopover = function (service, pos) {
            self.addMemberForm.numbers[pos] = service.serviceName;
        };

        self.resetMemberAddForm = function () {
            self.addMemberForm.numbers = [null];
            self.addMemberForm.options = {
                timeout: 20,
                wrapUpTime: 1,
                simultaneousLines: 1,
                status: "available"
            };
        };

        self.getServicesToExclude = function () {
            var services = _.pluck(self.api.getMemberList(), "number").concat(self.addMemberForm.numbers);
            self.servicesToExclude.splice(0, self.servicesToExclude.length);
            _.each(services, function (s) {
                self.servicesToExclude.push(s);
            });
            return self.servicesToExclude;
        };

        self.addMembers = function (form) {
            const modal = $uibModal.open({
                animation: true,
                templateUrl: "components/telecom/telephony/alias/members/telecom-telephony-alias-members-add-modal.html",
                controller: "telecomTelephonyAliasMembersAddModal",
                controllerAs: "$ctrl"
            });
            modal.result.then(() => {
                self.loaders.adding = true;
                return self.api.addMembers(_(self.addMemberForm.numbers).filter(function (number) {
                    return number && number.length;
                }).map(function (number) {
                    return _.assign({number: number}, self.addMemberForm.options);
                }).value()).then(function () {
                    Toast.success($translate.instant("telephony_alias_members_add_success"));
                    self.resetMemberAddForm();
                    form.$setPristine();
                }).catch(function (err) {
                    return new ToastError(err);
                }).finally(function () {
                    self.loaders.adding = false;
                });
            });
        };

        self.removeMemberAt = function (index) {
            if (index === 0 && self.addMemberForm.numbers.length === 1) {
                self.addMemberForm.numbers[0] = null;
            } else {
                _.pullAt(self.addMemberForm.numbers, index);
            }
        };
    }
});
