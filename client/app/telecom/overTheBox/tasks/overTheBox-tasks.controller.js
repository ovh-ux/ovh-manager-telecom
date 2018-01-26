angular.module("managerApp").controller("OverTheBoxTasksCtrl", function ($translate, $q, $stateParams, PAGINATION_PER_PAGE, OvhApiOverTheBox, Toast) {
    "use strict";

    const self = this;

    self.loaders = {
        init: true
    };

    self.taskIds = [];
    self.tasks = [];
    self.serviceName = $stateParams.serviceName;
    self.filter = {
        perPage: PAGINATION_PER_PAGE
    };

    this.$onInit = function () {
        $q.all([
            self.getTasks()
        ]);
    };

    self.getTasks = function () {
        OvhApiOverTheBox.Lexi().getTasks({ serviceName: $stateParams.serviceName }).$promise
            .then((taskIds) => {
                self.taskIds = taskIds.map((id) => ({ id }));
            })
            .catch((error) => Toast.error(`${$translate.instant("an_error_occured")} ${error.data.message}`));
    };

    self.transformItem = function (row) {
        return OvhApiOverTheBox.Lexi().getTask({ serviceName: $stateParams.serviceName, taskId: row.id }).$promise
            .catch((error) => Toast.error(`${$translate.instant("an_error_occured")} ${error.data.message}`));
    };
});
