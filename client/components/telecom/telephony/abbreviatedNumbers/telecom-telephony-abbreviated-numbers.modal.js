angular.module("managerApp").controller("telecomTelephonyAbbreviatedNumbersModal",
                                        function ($scope, $q, $translate, $uibModalInstance, data) {
                                            "use strict";

                                            var self = this;

                                            self.loading = {
                                                updating: false
                                            };

                                            angular.extend(self, data);

                                            self.numberPattern = /^00\d{2,3}[\s\d]+$/;
                                            self.namePattern = /^[a-zA-Z0-9\s]*$/;

                                            self.cancel = function () {
                                                $uibModalInstance.dismiss("cancel");
                                            };

                                            self.send = function () {
                                                self.errorMessage = null;
                                                self.loading.updating = true;
                                                $q.when(self.saveCallback({ value: self.data })).then(
                                                    function () {
                                                        $uibModalInstance.close(self.data);
                                                    },
                                                    function (err) {
                                                        if (/^This abbreviated/.test(err.data.message)) {
                                                            self.errorMessage = $translate.instant("telephony_abbreviated_numbers_not_free_error");
                                                        } else {
                                                            self.errorMessage = $translate.instant("telephony_abbreviated_numbers_save_error");
                                                        }
                                                        $q.reject(err);
                                                    }
                                                ).finally(function () {
                                                    self.loading.updating = false;
                                                });
                                            };
                                        }
);
