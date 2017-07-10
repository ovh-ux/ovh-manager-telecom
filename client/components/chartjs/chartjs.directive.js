angular.module("managerApp").directive("chartjs", function directive (Chart) {
    "use strict";
    return {
        restrict: "A",
        scope: {
            chartjs: "=?"
        },
        bindToController: true,
        controllerAs: "$ctrl",
        templateUrl: "components/chartjs/chartjs.html",
        link: function (scope, element, attrs, controller) {
            var canvas = element.children().get(0);
            canvas.id = _.uniqueId("chartjs");
            controller.ctx = canvas.getContext("2d");
        },
        controller: function directiveController ($scope) {
            var self = this;

            this.createChart = function (data) {
                if (this.chartInstance) {
                    this.chartInstance.destroy();
                }
                this.chartInstance = new Chart(this.ctx, data || this.chartjs);
            };

            this.$onInit = function () {
                $scope.$watch("$ctrl.chartjs", function (data) {
                    if (data) {
                        self.createChart(data);
                    }
                });

                $scope.$on("destroy", function () {
                    if (self.chartInstance) {
                        self.chartInstance.destroy();
                    }
                });
            };
        }
    };
});
