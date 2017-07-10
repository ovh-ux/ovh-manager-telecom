angular.module("managerApp")
    .service("NotificationElement", function () {
        "use strict";

        var NotificationElement = function (element, editMode) {
            this.type = element.type;
            this.frequency = element.frequency;
            this.email = this.type === "mail" ? element.email : null;
            this.phone = this.type === "sms" ? element.phone : null;
            this.smsAccount = element.smsAccount;
            this.xdslService = element.xdslService;
            this.editMode = editMode === true;
            this.id = element.id;
        };

        NotificationElement.prototype = {
            isValidSms: function () {
                return (this.type === "sms") && this.phone && this.smsAccount;
            },
            isValidEmail: function () {
                return (this.type === "mail") && this.email;
            },
            isValid: function () {
                return this.frequency && this.type && (this.isValidEmail() || this.isValidSms());
            },
            getCreationData: function () {
                var data = {
                    frequency: this.frequency,
                    type: this.type
                };
                switch (this.type) {
                case "sms":
                    data.phone = this.phone;
                    data.smsAccount = this.smsAccount;
                    break;
                case "mail":
                    data.email = this.email;
                    break;
                default:
                }
                return data;
            }
        };

        return NotificationElement;
    }
    );
