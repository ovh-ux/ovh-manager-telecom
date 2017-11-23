/**
 * ovh-angular-toaster replacement.
 */
angular.module("managerApp").service("Toast", function ($timeout) {
    "use strict";

    var self = this;

    let defaultOptions = {
        hideAfter: 42000 // default time in milliseconds for message to be displayed
    };

    let messages = []; // list of message

    function pushMessage (message, type, opts) {
        let options = _.defaults(opts || {}, defaultOptions);

        let timeout = _.get(options, "hideAfter");
        let msg = {
            content: message,
            type: type
        };

        messages.push(msg);

        if (angular.isNumber(timeout)) {
            $timeout(() => {
                _.remove(messages, msg);
            }, timeout);
        }
    }

    self.success = function (message, opts) {
        pushMessage(message, "success", opts);
    };

    self.info = function (message, opts) {
        pushMessage(message, "info", opts);
    };

    self.warn = function (message, opts) {
        pushMessage(message, "warning", opts);
    };

    self.error = function (message, opts) {
        pushMessage(message, "error", opts);
    };

    self.clearMessages = function () {
        messages = [];
    };

    self.clearMessage = function (message) {
        messages = _.filter(messages, (msg) => msg !== message);
    };

    self.clearMessagesByType = function (type) {
        messages = _.filter(messages, (msg) => msg.type !== type);
    };

    self.getMessages = function () {
        return messages;
    };

    self.getMessagesByType = function (type) {
        return _.filter(messages, { type: type });
    };
});
