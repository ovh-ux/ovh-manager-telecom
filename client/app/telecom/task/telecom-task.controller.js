angular.module("managerApp").controller("TelecomTaskCtrl", function ($scope, $translate, OvhApiPackXdslTask, ToastError, TASK_STATUS, PAGINATION_PER_PAGE) {
    "use strict";

    var self = this;
    var statusInfo = TASK_STATUS;

    self.allTasks = {
        sortby: "pack",
        reverse: false,
        result: {
            data: [],
            count: 0
        },
        filter: {
            page: 1,
            perPage: PAGINATION_PER_PAGE,
            status: "todo doing cancelled error problem"
        },
        tip: $translate.instant("task_all")
    };

    /**
     * Refresh data on a given tab
     * @param tab
     * @returns {*}
     */
    self.getData = function (tab) {
        if (tab.sortby) {
            tab.filter.sort = tab.sortby + " " + (tab.reverse ? "ASC" : "DESC");
        }
        tab.loading = true;
        tab.result.data = [];
        OvhApiPackXdslTask.Aapi().detailsAll(
            tab.filter,
            function (data) {
                tab.result.data = data;
                for (var i = 0; i < tab.result.data.length; i++) {
                    data[i].status = {
                        icon: statusInfo[data[i].status].icon,
                        name: data[i].status,
                        tip: $translate.instant("telecom_task_" + data[i].status)
                    };
                }
                tab.loading = false;
            },
            ToastError
        );
    };

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/
    self.$onInit = function () {
        self.getData(self.allTasks);

        $scope.$watch("TaskCtrl.allTasks.filter.page", function (newPage, oldPage) {
            if (newPage && (newPage !== oldPage)) {
                self.getData(self.allTasks, true);
            }
        });
    };

});
