angular.module("managerApp").service("telephonyBulk", function () {
    "use strict";

    var self = this;

    self.getToastInfos = function (bulkResult, messages) {
        var infos = [];

        // manage full success
        if (!bulkResult.error.length) {
            return [{
                type: "success",
                message: messages.fullSuccess
            }];
        }

        // manage partial success
        if (bulkResult.success.length) {
            infos.push({
                type: "success",
                message: messages.partialSuccess
            });
        }

        // manage errors
        if (bulkResult.error.length) {
            var errorList = "<ul>";
            bulkResult.error.forEach(function (error) {
                errorList += "<li>" + [error.serviceName, _.map(error.errors, "error").join(", ")].join(" - ") + "</li>";
            });
            errorList += "</ul>";

            infos.push({
                type: "error",
                message: messages.error + errorList
            });
        }

        return infos;
    };

});
