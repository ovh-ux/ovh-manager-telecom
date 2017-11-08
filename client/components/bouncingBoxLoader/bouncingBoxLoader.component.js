angular.module("managerApp").component("bouncingBoxLoader", {
    templateUrl: "components/bouncingBoxLoader/bouncingBoxLoader.html",
    transclude: true,
    controller: class {
        $onInit () {
            const LOADER_SIZE_AVAILABLE = ["s", "m", "l"];

            this.size = this.size || "l";

            if (_.indexOf(LOADER_SIZE_AVAILABLE, this.size) === -1) {
                throw new Error("size option must be specified as 's', 'm' or 'l'");
            }
        }
    },
    bindings: {
        size: "@?"
    }
});
