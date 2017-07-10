angular.module("managerApp").controller("OverTheBoxTasksCtrl", function ($translate, $q, $stateParams, PAGINATION_PER_PAGE, OverTheBox, Toast) {
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

    function init () {
        self.loaders.init = true;
        $q.all([
            self.getTasks()
        ]).finally(function () {
            self.loaders.init = false;
        });
    }

    self.getTasks = function () {
        self.loaders.tasks = true;
        return OverTheBox.Lexi().getTasks({ serviceName: self.serviceName }).$promise.then(
            function (taskIds) {
                self.taskIds = taskIds;
            },
            function (error) {
                Toast.error([$translate.instant("an_error_occured"), error.data.message].join(" "));
            }
        ).finally(function () {
            self.loaders.tasks = false;
        });
    };

    self.onTransformItem = function (id) {
        self.loaders.init = true;
        return OverTheBox.Lexi().getTask({ serviceName: $stateParams.serviceName, taskId: id });
    };

    self.onTransformItemDone = function () {
        self.loaders.init = false;
    };

    init();

});
