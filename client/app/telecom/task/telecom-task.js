angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.task", {
        url: "/task",
        views: {
            "telecomView@telecom": {
                templateUrl: "app/telecom/task/telecom-task.html",
                controller: "TelecomTaskCtrl",
                controllerAs: "TaskCtrl"
            }
        },
        translations: ["common", "telecom/task"],
        resolve: {
            $title: function (translations, $translate) {
                return $translate("telecom_task_page_title");
            }
        }
    });
});
