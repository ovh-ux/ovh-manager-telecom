(function () {
    "use strict";

    angular.module("managerApp").constant("UI_SORTABLE_HELPERS", {
        variableHeightTolerance: function (e, ui) {
            var container = $(this);
            var placeholder = container.children(".ui-sortable-placeholder:first");
            var helpHeight = ui.helper.outerHeight();
            var helpTop = ui.position.top;
            var helpBottom = helpTop + helpHeight;

            container.children().each(function () {
                var item = $(this);

                if (!item.hasClass("ui-sortable-helper") && !item.hasClass("ui-sortable-placeholder")) {
                    var itemHeight = item.outerHeight();
                    var itemTop = item.position().top;
                    var itemBottom = itemTop + itemHeight;
                    var tolerance;
                    var distance;

                    if ((helpTop > itemTop) && (helpTop < itemBottom)) {
                        tolerance = Math.min(helpHeight, itemHeight) / 2;
                        distance = helpTop - itemTop;

                        if (distance < tolerance) {
                            placeholder.insertBefore(item);
                            container.sortable("refreshPositions");
                            return false;
                        }

                    } else if ((helpBottom < itemBottom) && (helpBottom > itemTop)) {
                        tolerance = Math.min(helpHeight, itemHeight) / 2;
                        distance = itemBottom - helpBottom;

                        if (distance < tolerance) {
                            placeholder.insertAfter(item);
                            container.sortable("refreshPositions");
                            return false;
                        }
                    }
                }

                return null;
            });
        }
    });
})();
