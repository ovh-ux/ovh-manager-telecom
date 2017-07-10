angular.module("managerApp").controller("TelecomSmsSmsTemplatesCtrl", function ($q, $translate, $stateParams, $uibModal, Sms, SmsMediator, Toast, ToastError) {
    "use strict";

    var self = this;

    this.loading = {
        init: false
    };

    this.service = null;

    this.templates = {
        raw: null,
        paginated: null,
        orderBy: "name",
        orderDesc: false,
        isLoading: false
    };

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    this.getDetails = function getDetails (item) {
        self.templates.isLoading = true;
        return Sms.Templates().Lexi().get({
            serviceName: $stateParams.serviceName,
            name: item
        }).$promise;
    };

    this.orderBy = function orderBy (by) {
        if (self.templates.orderBy === by) {
            self.templates.orderDesc = !self.templates.orderDesc;
        } else {
            self.templates.orderBy = by;
        }
    };

    this.onTransformItemDone = function onTransformItemDone () {
        self.templates.isLoading = false;
    };

    self.refresh = function () {
        Sms.Templates().Lexi().resetCache();
        Sms.Templates().Lexi().resetQueryCache();
        self.templates.raw = null;
        self.templates.isLoading = true;
        return Sms.Templates().Lexi().query({
            serviceName: $stateParams.serviceName
        }).$promise.then(function (templates) {
            self.templates.raw = templates;
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.templates.isLoading = false;
        });
    };

    this.add = function add () {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/sms/templates/add/telecom-sms-sms-templates-add.html",
            controller: "TelecomSmsSmsTemplateAddCtrl",
            controllerAs: "TemplateAddCtrl"
        });

        modal.result.then(function () {
            return Sms.Templates().Lexi().query({
                serviceName: $stateParams.serviceName
            }).$promise.then(function (templates) {
                self.templates.raw = templates;
            });
        }, function (error) {
            if (error && error.type === "API") {
                Toast.error($translate.instant("sms_sms_templates_adding_ko", { error: _.get(error, "msg.data.message") }));
            }
        });

        return modal;
    };

    self.edit = function (template) {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/sms/templates/edit/telecom-sms-sms-templates-edit.html",
            controller: "TelecomSmsSmsTemplateEditCtrl",
            controllerAs: "TemplateEditCtrl",
            resolve: {
                template: function () { return template; }
            }
        });

        modal.result.then(function () {
            self.refresh();
        }, function (error) {
            if (error && error.type === "API") {
                Toast.error($translate.instant("sms_sms_templates_editing_ko", { error: _.get(error, "msg.data.message") }));
            }
        });

        return modal;
    };

    self.relaunch = function (template) {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/sms/templates/relaunch/telecom-sms-sms-templates-relaunch.html",
            controller: "TelecomSmsSmsTemplateRelaunchCtrl",
            controllerAs: "TemplateRelaunchCtrl",
            resolve: {
                template: function () { return template; }
            }
        });

        modal.result.then(function () {
            self.refresh();
        }, function (error) {
            if (error && error.type === "API") {
                Toast.error($translate.instant("sms_sms_templates_relaunching_ko", { error: _.get(error, "msg.data.message") }));
            }
        });

        return modal;
    };

    self.remove = function (template) {

        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/sms/templates/remove/telecom-sms-sms-templates-remove.html",
            controller: "TelecomSmsSmsTemplateRemoveCtrl",
            controllerAs: "TemplateRemoveCtrl",
            resolve: {
                template: function () { return template; }
            }
        });

        modal.result.then(function () {
            return Sms.Templates().Lexi().query({
                serviceName: $stateParams.serviceName
            }).$promise.then(function (templates) {
                self.templates.raw = templates;
            });
        }, function (error) {
            if (error && error.type === "API") {
                Toast.error($translate.instant("sms_sms_templates_removing_ko", { error: _.get(error, "msg.data.message") }));
            }
        });

        return modal;
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.init = true;

        return SmsMediator.initDeferred.promise.then(function () {
            return Sms.Templates().Lexi().query({
                serviceName: $stateParams.serviceName
            }).$promise.then(function (templates) {
                self.templates.raw = templates;
            });
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loading.init = false;
            self.service = SmsMediator.getCurrentSmsService();
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
