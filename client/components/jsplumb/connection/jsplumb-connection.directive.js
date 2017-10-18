angular.module("managerApp").directive("jsplumbConnection", function () {
    "use strict";

    return {
        restrict: "A",
        controller: "jsplumbConnectionCtrl",
        controllerAs: "$ctrl",
        require: ["^^jsplumb", "^^jsplumbEndpoint", "jsplumbConnection"],
        scope: {
            options: "=jsplumbConnection",
            target: "@jsplumbConnectionTarget"
        },
        bindToController: true,
        link: function (iScope, iElement, iAttrs, $ctrl) {
            var jsplumbCtrl = $ctrl[0];
            var endpointCtrl = $ctrl[1];
            var connectionCtrl = $ctrl[2];

            jsplumbCtrl.instance.setSuspendDrawing(true);

            connectionCtrl.connection = jsplumbCtrl.instance.connect(angular.extend({
                uuids: [endpointCtrl.uuid, connectionCtrl.target],
                deleteEndpointsOnDetach: false
            }, connectionCtrl.options || {}));

            jsplumbCtrl.instance.customRepaint();

            /**
             *  Directive destroy management. Detach connection from instance.
             */
            iScope.$on("$destroy", function () {
                try {
                    if (jsplumbCtrl.instance) {
                        jsplumbCtrl.instance.detach(connectionCtrl.connection);
                        jsplumbCtrl.instance.customRepaint();
                    }
                } finally {

                    /* continue regardless of error */
                }
            });

            iScope.$watch("$ctrl.target", function (newTarget, oldTarget) {
                if (oldTarget && oldTarget !== newTarget) {
                    jsplumbCtrl.instance.setSuspendDrawing(true);

                    // recreate connection
                    connectionCtrl.connection = jsplumbCtrl.instance.connect({
                        uuids: [endpointCtrl.uuid, newTarget]
                    });

                    jsplumbCtrl.instance.customRepaint();
                }
            });

            iScope.$watch("$ctrl.options.cssClass", function (newClass, oldClass) {
                if (newClass || oldClass) {
                    if (newClass === oldClass) {
                        connectionCtrl.connection.addClass(newClass);
                    } else {
                        connectionCtrl.connection.updateClasses(newClass, oldClass);
                    }
                }
            });

        }
    };
});
