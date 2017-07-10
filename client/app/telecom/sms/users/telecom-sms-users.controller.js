angular.module("managerApp").controller("TelecomSmsUsersCtrl", function ($stateParams, $q, $filter, $uibModal, $translate, Sms, SmsMediator, Toast, ToastError) {
    "use strict";

    var self = this;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function fetchUsers () {
        return Sms.Users().Lexi().query({
            serviceName: $stateParams.serviceName
        }).$promise.then(function (loginIds) {
            return $q.all(_.map(loginIds, function (login) {
                return Sms.Users().Lexi().get({
                    serviceName: $stateParams.serviceName,
                    login: login
                }).$promise;
            }));
        });
    }

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.refresh = function () {
        Sms.Users().Lexi().resetAllCache();
        self.users.isLoading = true;
        return fetchUsers().then(function (users) {
            self.users.raw = angular.copy(users);
            self.applySorting();
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.users.isLoading = false;
        });
    };

    self.applySorting = function () {
        var data = angular.copy(self.users.raw);
        data = $filter("orderBy")(
            data,
            self.users.orderBy,
            self.users.orderDesc
        );
        self.users.sorted = data;
    };

    self.orderBy = function (by) {
        if (self.users.orderBy === by) {
            self.users.orderDesc = !self.users.orderDesc;
        } else {
            self.users.orderBy = by;
        }
        self.applySorting();
    };

    self.add = function () {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/users/add/telecom-sms-users-add.html",
            controller: "TelecomSmsUsersAddCtrl",
            controllerAs: "UsersAddCtrl"
        });

        modal.result.then(function () {
            return self.refresh();
        }, function (error) {
            if (error && error.type === "API") {
                Toast.error($translate.instant("sms_users_add_user_ko", { error: _.get(error, "msg.data.message") }));
            }
        });

        return modal;
    };

    self.templates = function () {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/users/templates/telecom-sms-users-templates.html",
            controller: "TelecomSmsUsersTemplatesCtrl",
            controllerAs: "UsersTemplatesCtrl",
            resolve: {
                service: function () { return self.service; }
            }
        });

        modal.result.then(function () {
            return Sms.Lexi().get({
                serviceName: $stateParams.serviceName
            }).$promise.then(function (service) {
                self.service = service;
            }).catch(function (error) {
                return new ToastError(error);
            });
        }, function (error) {
            if (error && error.type === "API") {
                Toast.error($translate.instant("sms_users_templates_update_ko", { error: _.get(error, "msg.data.message") }));
            }
        });

        return modal;
    };

    self.changePassword = function (user) {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/users/change-password/telecom-sms-users-change-password.html",
            controller: "TelecomSmsUsersChangePasswordCtrl",
            controllerAs: "UsersChangePasswordCtrl",
            resolve: {
                user: function () { return user; }
            }
        });

        modal.result.then(function () {
            return self.refresh();
        }, function (error) {
            if (error && error.type === "API") {
                Toast.error($translate.instant("sms_users_change_password_user_ko", { error: _.get(error, "msg.data.message") }));
            }
        });

        return modal;
    };

    self.quota = function (user) {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/users/quota/telecom-sms-users-quota.html",
            controller: "TelecomSmsUsersQuotaCtrl",
            controllerAs: "UsersQuotaCtrl",
            resolve: {
                user: function () { return user; },
                service: function () { return self.service; }
            }
        });

        modal.result.then(function () {
            return self.refresh();
        }, function (error) {
            if (error && error.type === "API") {
                Toast.error($translate.instant("sms_users_quota_user_ko", { error: _.get(error, "msg.data.message") }));
            }
        });

        return modal;
    };

    self.limit = function (user) {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/users/limit/telecom-sms-users-limit.html",
            controller: "TelecomSmsUsersLimitCtrl",
            controllerAs: "UsersLimitCtrl",
            resolve: {
                user: function () { return user; }
            }
        });

        modal.result.then(function () {
            return self.refresh();
        }, function (error) {
            if (error && error.type === "API") {
                Toast.error($translate.instant("sms_users_limit_user_ko", { error: _.get(error, "msg.data.message") }));
            }
        });

        return modal;
    };

    self.restrict = function (user) {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/users/restrict/telecom-sms-users-restrict.html",
            controller: "TelecomSmsUsersRestrictByIpCtrl",
            controllerAs: "UsersRestrictByIpCtrl",
            resolve: {
                user: function () { return user; }
            }
        });

        modal.result.then(function () {
            return self.refresh();
        }, function (error) {
            if (error && error.type === "API") {
                Toast.error($translate.instant("sms_users_restrict_user_ko", { error: _.get(error, "msg.data.message") }));
            }
        });

        return modal;
    };

    self.callback = function (user) {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/users/callback/telecom-sms-users-callback.html",
            controller: "TelecomSmsUsersCallbackCtrl",
            controllerAs: "UsersCallbackCtrl",
            resolve: {
                user: function () { return user; }
            }
        });

        modal.result.then(function () {
            return self.refresh();
        }, function (error) {
            if (error && error.type === "API") {
                Toast.error($translate.instant("sms_users_callback_user_ko", { error: _.get(error, "msg.data.message") }));
            }
        });

        return modal;
    };

    self.remove = function (user) {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/users/remove/telecom-sms-users-remove.html",
            controller: "TelecomSmsUsersRemoveCtrl",
            controllerAs: "UsersRemoveCtrl",
            resolve: {
                user: function () { return user; }
            }
        });

        modal.result.then(function () {
            return self.refresh();
        }, function (error) {
            if (error && error.type === "API") {
                Toast.error($translate.instant("sms_users_remove_user_ko", { error: _.get(error, "msg.data.message") }));
            }
        });

        return modal;
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.service = null;

        self.users = {
            raw: null,
            paginated: null,
            sorted: null,
            orderBy: "login",
            orderDesc: false,
            isLoading: false
        };

        return self.refresh().then(function () {
            self.service = SmsMediator.getCurrentSmsService();
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
