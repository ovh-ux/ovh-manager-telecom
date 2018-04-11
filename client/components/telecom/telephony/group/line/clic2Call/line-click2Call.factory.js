angular.module("managerApp").factory("TelephonyGroupLineClick2Call",
                                     function ($q, OvhApiTelephony, TelephonyGroupLineClick2CallUser) {
                                         "use strict";

                                         var mandatoriesPhoneOptions = [
                                             "billingAccount",
                                             "serviceName"
                                         ];
                                         var mandatoryNb;

                                         /*= ==================================
        =            CONSTRUCTOR            =
        ===================================*/

                                         function TelephonyGroupLineClickToCall (mandatoryOptions) {
                                             mandatoryNb = mandatoriesPhoneOptions.length;
                                             if (!mandatoryOptions) {
                                                 throw new Error("mandatory options must be specified when creating a new TelephonyGroupLineClick2CallUser");
                                             } else {
                                                 for (mandatoryNb; mandatoryNb--;) {
                                                     if (!mandatoryOptions[mandatoriesPhoneOptions[mandatoryNb]]) {
                                                         // check mandatory attributes
                                                         throw new Error(mandatoriesPhoneOptions[mandatoryNb] + " option must be specified when creating a new TelephonyGroupLineClick2CallUser");
                                                     } else {
                                                         // set mandatory attributes
                                                         this[mandatoriesPhoneOptions[mandatoryNb]] = mandatoryOptions[mandatoriesPhoneOptions[mandatoryNb]];
                                                     }
                                                 }
                                             }

                                             this.users = [];
                                         }

                                         /* -----  End of CONSTRUCTOR  ------*/

                                         /*= ========================================
        =            PROTOTYPE METHODS            =
        =========================================*/

                                         TelephonyGroupLineClickToCall.prototype.getUsers = function () {
                                             var self = this;
                                             self.users = [];

                                             return OvhApiTelephony.Line().Click2Call().User().v6().query({
                                                 billingAccount: self.billingAccount,
                                                 serviceName: self.serviceName
                                             }, null).$promise.then(function (users) {
                                                 var request = [];

                                                 angular.forEach(users, function (userId) {

                                                     var user = new TelephonyGroupLineClick2CallUser({
                                                         billingAccount: self.billingAccount,
                                                         serviceName: self.serviceName
                                                     }, {
                                                         id: userId
                                                     });

                                                     request.push(user.getUser().then(function (userDetails) {
                                                         self.users.push(userDetails);
                                                         return userDetails;
                                                     }));
                                                 });

                                                 return $q.all(request).finally(function () {
                                                     return self.users;
                                                 });

                                             }, function () {
                                                 return $q.when(self.users);
                                             });
                                         };

                                         TelephonyGroupLineClickToCall.prototype.call = function (calledNumber) {
                                             var self = this;

                                             return OvhApiTelephony.Line().Click2Call().v6().post({
                                                 billingAccount: self.billingAccount,
                                                 serviceName: self.serviceName
                                             }, {
                                                 calledNumber: calledNumber
                                             }).$promise.then(function (voidResponse) {
                                                 return voidResponse;
                                             });
                                         };

                                         return TelephonyGroupLineClickToCall;

                                     }
);
