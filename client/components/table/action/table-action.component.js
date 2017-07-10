angular.module("managerApp").directive("tableAction", function () {
    "use strict";
    return {
        retrict: "A",
        templateUrl: "components/table/action/table-action.html",
        scope: true,
        transclude: true,
        link: function (scope, element, attrs, ctrl, transclude) {
            transclude(scope, function (transclusion) {
                var container = element.find("ul.action-menu");
                var items = _.filter(transclusion, function (elt) {
                    return elt.nodeType === 1;
                });

                // add column and row lines
                _.forEach(items, function (elt, index) {
                    var rows = Math.floor((items.length - 1) / 3);
                    var isLastRow = Math.floor(index / 3) === rows;
                    var isLastCol = (index + 1) % 3 === 0;
                    if (!isLastRow) {
                        elt.className += " lines";
                    }
                    if (!isLastCol && items.length !== 1 && (items.length !== 2 || index === 0)) {
                        elt.className += " columns";
                    }
                });

                // resize if only one or 2 elements
                if (items.length === 2) {
                    container.addClass("two");
                    element.find("div.arrow").addClass("two");
                }
                if (items.length === 1) {
                    container.addClass("one");
                    element.find("div.arrow").addClass("one");
                }

                // transclude !
                container.append(transclusion);
            });
        }
    };
});
