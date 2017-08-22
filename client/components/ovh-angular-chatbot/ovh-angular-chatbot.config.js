"use strict";

angular.module("managerApp").config(function (chatbotServiceProvider) {
    chatbotServiceProvider.setChatbotUrl("/chatbot");
});
