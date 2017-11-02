"use strict";

angular.module("managerApp").component("toastMessage", {
    templateUrl: "components/toaster/toast-message.html",
    controller: function (Toast, $timeout) {

        let timestamp = (new Date()).getTime();

        this.hasNewMessages = false;

        this.messageTypes = [
            "error",
            "warning",
            "info",
            "success"
        ];

        this.getMessagesByType = (type) => {
            let messages = Toast.getMessagesByType(type);

            // update messages timestamp
            let pendingMessages = _.filter(Toast.getMessages(), (m) => !m.timestamp);

            if (pendingMessages.length) {
                this.hasNewMessages = true;
                $timeout(() => {
                    this.hasNewMessages = false;
                }, 1000);
            }

            _.each(pendingMessages, (m) => {
                m.timestamp = timestamp;
            });

            // do not display old messages
            return _.filter(messages, (m) => m.timestamp >= timestamp);
        };

        this.getAllMessages = () => Toast.getMessages();

        this.hasMessagesOfType = (type) => this.getMessagesByType(type).length > 0;

        this.clearMessage = (message) => Toast.clearMessage(message);

        this.clearMessagesByType = (type) => Toast.clearMessagesByType(type);
    }
});
