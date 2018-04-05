angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.overTheBox.tasks", {
        url: "/tasks",
        views: {
            "otbView@telecom.overTheBox": {
                templateUrl: "app/telecom/overTheBox/tasks/overTheBox-tasks.html",
                controller: "OverTheBoxTasksCtrl",
                controllerAs: "OverTheBoxTasks"
            }
        },
        translations: ["common", "telecom/overTheBox", "telecom/overTheBox/tasks"]
    });
});
