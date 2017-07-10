angular.module("managerApp").directive("gauge", function () {
    "use strict";
    return {
        restrict: "A",
        templateUrl: "components/gauge/gauge.html",
        scope: {
            gauge: "=?",
            gaugeWidth: "=?",
            ngModel: "=?"
        },
        controllerAs: "$ctrl",
        bindToController: true,
        link: function (scope, elt, attrs, controller) {
            controller.cursor = elt.find(".gauge-cursor");
            controller.svg = elt.find("svg.gauge");
            controller.gaugeContainer = elt.find("g.gauge");
        },
        controller: function ($scope, $interval) {
            var self = this;
            var going;
            var targetValue = 0;
            var currentValue = 0;

            function goto (value) {
                targetValue = value || 0;
                if (going) {
                    return;
                }
                going = $interval(function () {
                    var speed = Math.abs(targetValue - currentValue) / (self.gauge || 1);
                    if (speed > 0.05) {
                        var dir = (targetValue - currentValue) / Math.abs(targetValue - currentValue);
                        currentValue += dir * speed * self.gauge / 5;
                        var fraction = (currentValue || 0) / (self.gauge || 1);
                        self.cursor.attr("transform", "rotate(" + (180 * fraction) + ")");
                    } else {
                        $interval.cancel(going);
                        going = undefined;
                    }
                }, 100);
            }

            $scope.$on("destroy", function () {
                if (going) {
                    $interval.cancel(going);
                }
            });

            $scope.$watch("$ctrl.gaugeWidth", function (width) {
                var scale = (width || 100) / 440;
                self.gaugeContainer.attr("transform", "scale(" + scale + ")");
                self.svg.css("width", Math.ceil(440 * scale) + "px");
                self.svg.css("height", Math.ceil(320 * scale) + "px");
            });

            $scope.$watch("$ctrl.ngModel", goto);
        }
    };
});
