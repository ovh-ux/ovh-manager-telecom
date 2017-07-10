angular.module("managerApp").directive("jsplumb", function () {
    "use strict";

    return {
        restrict: "A",
        controller: "jsplumbCtrl",
        scope: {
            options: "=jsplumb",
            instance: "=jsplumbInstance"
        },
        bindToController: true,
        link: {
            pre: function (iScope, iElement, iAttrs, $ctrl) {
                // create a jsplumb instance with given options and with directive element as container
                $ctrl.instance = jsPlumb.getInstance(angular.extend($ctrl.options || {}, {
                    Container: iElement
                }));

                // avoid jsplumb to draw something when endpoints or connections are added to instance
                $ctrl.instance.setSuspendDrawing(true);

                // set a custom redraw method for jsplumb instance
                $ctrl.instance.customRepaint = $ctrl.askForRepaint;

                // handle window resize
                var onResizePage = _.debounce(function onResizePage () {
                    if ($ctrl.instance) {
                        $ctrl.instance.customRepaint();
                    }
                }, 33);
                var windowElt = $(window);

                windowElt.on("resize", onResizePage);

                /**
                 * window.on("resize") is not triggered when scrollbar appears and might cause a display bug.
                 * We need to watch the window element to handle the scrollbar display. We also need to keep
                 * the window.on("resize") binding because it will be triggered as soon as window is resized.
                 */
                iScope.$watch(function () {
                    return {
                        h: windowElt.height(),
                        w: windowElt.width()
                    };
                }, onResizePage, true);

                iScope.$on("$destroy", function () {
                    if ($ctrl.instance) {
                        windowElt.off("resize", onResizePage);
                        $ctrl.instance.reset();
                    }
                    $ctrl.instance = null;
                });
            }
        }
    };
});
