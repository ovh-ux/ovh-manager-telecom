angular.module("managerApp").controller("EditableServiceNameCtrl", function ($translate) {
    "use strict";

    var self = this;

    self.inEdition = false;
    self.model = {
        serviceName: null
    };
    self.loading = {
        save: false
    };

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.startEdition = function () {
        self.inEdition = true;
        self.model.serviceName = self.title;
        if (self.onEditStart) {
            self.onEditStart()();
        }
    };

    self.cancelEdition = function () {
        self.inEdition = false;
        self.model.serviceName = null;
        if (self.onEditCancel) {
            self.onEditCancel()();
        }
    };

    self.saveServiceName = function () {
        self.loading.save = true;
        return self.onSave()(self.model.serviceName).finally(function () {
            self.cancelEdition();
            self.loading.save = false;
        });
    };

    self.getTitle = function () {
        return $translate.instant("common_service_name_edit_title", { title: this.title }, null, null, function (value, mode) {
            if (mode === "params") {
                var sanitized = {};

                // allow attribute values as per W3C (https://www.w3.org/TR/xml/#NT-AttValue)
                _.forEach(Object.keys(value), function (key) {
                    if (angular.isString(value[key])) {
                        sanitized[key] = value[key].replace(/[<&"]/g, "");
                    } else {
                        sanitized[key] = value[key];
                    }
                });
                return sanitized;
            }
            return value;
        });
    };


    /* -----  End of ACTIONS  ------*/

});
