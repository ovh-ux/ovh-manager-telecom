angular.module("managerApp").directive("resizeVertical", function () {
    "use strict";

    return {
        restrict: "A",
        scope: {
            resizeVertical: "&"
        },
        link: function (scope, element) {
            var isResizing = false;
            var startPosition;
            var lastPosition;

            function callback (pos, status) {
                var position = pos;
                position = Number.isInteger(position) ? position : 0;
                scope.resizeVertical({
                    delta: position - lastPosition,
                    absolute: position - startPosition,
                    status: status
                });
            }

            var style = [
                "-moz-user-select: none",
                "-webkit-user-select: none",
                "-ms-user-select:none",
                "user-select:none",
                "-o-user-select:none",
                "cursor:s-resize"
            ];

            element.attr("style", style.join(";"))
                .attr("unselectable", "on")
                .attr("onselectstart", "return false;")
                .on("mousedown", function (e) {
                    isResizing = true;
                    startPosition = e.clientY;
                    lastPosition = e.clientY;
                    callback(e.clientY, "start");
                });

            angular.element(document)
                .on("mousemove", function (e) {
                    if (isResizing) {
                        callback(e.clientY, "doing");
                        lastPosition = e.clientY;
                    }
                })
                .on("mouseup", function (e) {
                    if (isResizing) {
                        isResizing = false;
                        callback(e.clientY, "end");
                    }
                });
        }
    };
});
