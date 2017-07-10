angular.module("managerApp").directive("groupConsumptionPieChart", function ($window) {
    "use strict";

    var d3 = $window.d3;
    if (!d3) {
        throw new Error("D3 must be load");
    }

    return {
        scope: {
            dataset: "="
        },
        controllerAs: "PieCtrl",
        controller: "GroupConsumptionPieChartCtrl",
        templateUrl: "components/telecom/telephony/group/consumption/pie-chart/telephony-group-consumption-pie-chart.html",
        link: function ($scope, $element, $attr, $ctrl) {

            var sizeRatio = $element.parent("div")[0].offsetWidth;
            var animationRatio = 20;
            var viewBox = sizeRatio + (animationRatio * 2);
            var radius = sizeRatio / 2;
            var data = $scope.dataset || [];

            // Take angular element and do a d3 node
            var svg = d3.select($element[0])
                .append("div")
                .classed("pie__container", true)
                .append("svg")
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "-" + animationRatio + " -" + animationRatio + " " + viewBox + " " + viewBox)
                .classed("pie__wrapper", true)
                .append("g")
                .attr("transform", "translate(" + (sizeRatio / 2) + "," + (sizeRatio / 2) + ")");

            // Create Arc specification
            var arc = d3.arc()
                .innerRadius(radius - 20)
                .outerRadius(radius);

            // Create Pie
            var pie = d3.pie()
                .value(function (d) {
                    return d.count;
                })
                .sort(null);

            // Create arcs
            var arcs = svg.selectAll("path")
                .data(pie(data))
                .enter()
                .append("path")
                .attr("d", arc)
                .attr("class", function (d) {
                    return d.data.label;
                }).each(function (d) {
                    return this._current === d;
                });

            /* var pathAnim = function (arc, dir) {
                switch (dir) {
                    case 0:
                        arc.transition()
                            .duration(500)
                            .ease(d3.easeBounce).attr("d", d3.arc()
                            .innerRadius(radius - animationRatio)
                            .outerRadius(radius)
                        );
                        break;
                    case 1:
                        arc.transition()
                            .duration(500)
                            .ease(d3.easeBounce).attr("d", d3.arc()
                            .innerRadius(radius)
                            .outerRadius(radius + animationRatio)
                        );
                        break;
                }
            };

            Manage click on Arc
            arcs.on("click", function () {
                var currentArc = d3.select(this);
                var clicked = currentArc.classed("clicked");

                pathAnim(currentArc, ~~(!clicked));
                currentArc.classed("clicked", !clicked);
            });*/

            $scope.$watchCollection("dataset", function (dataParam) {
                var duration = 1200;
                var theData = dataParam;

                if (theData) {

                    // Update data into controller
                    $ctrl.setDataset(theData);

                    if ($ctrl.getTotal() === 0) {
                        theData = [{
                            label: "empty",
                            count: 1
                        }];
                    }

                    // Update data in d3
                    arcs.data(pie(theData));

                    // Play awesome animation
                    arcs.transition()
                        .duration(duration)
                        .ease(d3.easeBounce)
                        .attr("class", function (d) {
                            return d.data.label;
                        })
                        .attrTween("d", function (a) {
                            var i = d3.interpolate(this._current, a);
                            this._current = i(0);
                            return function (t) {
                                return arc(i(t));
                            };
                        });
                }
            });
        }
    };
});
