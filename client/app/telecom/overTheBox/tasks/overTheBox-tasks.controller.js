angular.module("managerApp").controller("OverTheBoxTasksCtrl", function ($translate, $q, $stateParams, PAGINATION_PER_PAGE, OvhApiOverTheBox, Toast) {
    "use strict";

    var self = this;

    self.loaders = {
        init: true
    };

    self.taskIds = [];
    self.tasks = [];
    self.serviceName = $stateParams.serviceName;
    self.filter = {
        perPage: PAGINATION_PER_PAGE
    };

    self.$onInit = function () {
        $q.all([
            self.getTasks()
        ]);
    };

    self.getTasks = function () {
        OvhApiOverTheBox.v6().getTasks({ serviceName: $stateParams.serviceName }).$promise.then(
            function (taskIds) {
                self.taskIds = taskIds.map(function (taskId) {
                    return { id: taskId };
                });
            },
            function (error) {
                Toast.error([$translate.instant("an_error_occured"), error.data.message].join(" "));
            });
    };

    self.transformItem = function (row) {
        return OvhApiOverTheBox.v6().getTask({ serviceName: $stateParams.serviceName, taskId: row.id }).$promise.then(
            function (task) {
                return task;
            },
            function (error) {
                Toast.error([$translate.instant("an_error_occured"), error.data.message].join(" "));
            });
    };
});
