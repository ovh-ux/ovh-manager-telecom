angular.module("managerApp").controller("PackTaskCtrl", function ($scope, $translate, PAGINATION_PER_PAGE, TASK_STATUS, OvhApiPackXdslTask, ToastError) {
    "use strict";

    var self = this;
    this.allTasks = [];
    this.statusFilteredTasks = [];
    this.paginatedTasks = [];
    this.filter = {
        perPage: PAGINATION_PER_PAGE,
        page: 1
    };

    var getData = function () {
        return OvhApiPackXdslTask.Aapi().details({
            packName: $scope.Pack.pack.packName
        }).$promise.then(
            function (data) {
                self.allTasks = data;
            },
            ToastError
        );
    };

    var assignStatusToTasks = function () {
        for (var i = 0; i < self.allTasks.length; i++) {
            var status = self.allTasks[i].status;
            self.allTasks[i].status = self.status[self.allTasks[i].status];
            if (self.allTasks[i].status && status) {
                self.allTasks[i].status.tip = $translate.instant("telecom_task_" + status);
                self.allTasks[i].status.name = status;
            }
        }
    };

    self.updateFilteredTasks = function () {
        var result = self.allTasks;

        if (self.filter.status) {
            result = _.filter(self.allTasks, function (elem) {
                return elem.status.name === self.filter.status;
            });
        }

        self.statusFilteredTasks = result;
    };

    self.getStatusFilter = function () {
        var result = [{
            icon: "",
            title: $translate.instant("telecom_task_status"),
            tip: $translate.instant("telecom_task_filter_none"),
            "default": true
        }];

        for (var i in self.status) {
            if (self.status.hasOwnProperty(i)) {
                self.status[i].status = i;
                result.push(self.status[i]);
            }
        }

        return result;
    };

    self.filterTasksByStatus = function (item) {
        self.filter.status = item.status;
        self.updateFilteredTasks();
    };

    var init = function () {
        self.status = TASK_STATUS;
        self.filterChoices = self.getStatusFilter();
        self.filterSelect = {
            status: self.filterChoices[0]
        };

        getData().then(function () {
            assignStatusToTasks();
            self.updateFilteredTasks();
        });
    };

    init();
});
