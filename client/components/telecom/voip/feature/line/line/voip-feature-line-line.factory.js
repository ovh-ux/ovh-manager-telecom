angular.module("managerApp").factory("VoipLine", function (VoipLineFeature) {
    "use strict";

    class VoipLine extends VoipLineFeature {
        constructor (options = {}) {
            // set parent options
            super(options);

            // set VoipLine options
            this.infrastructure = options.infrastructure;
            this.isAttachedToOtherLinesPhone = options.isAttachedToOtherLinesPhone;
            this.simultaneousLines = options.simultaneousLines;
        }
    }

    return VoipLine;

});
