angular.module("managerApp").controller("telecomTelephonyAbbreviatedNumbersModal",
                                        function ($scope, $q, $translate, $uibModalInstance, data, Toast) {
                                            "use strict";

                                            var self = this;

                                            this.loading = {
                                                updating: false
                                            };

                                            angular.extend(this, data);

                                            this.numberPattern = /^00\d{2,3}[\s\d]+$/;
                                            this.namePattern = /^[a-zA-Z0-9\s]*$/;

                                            this.cancel = function () {
                                                $uibModalInstance.dismiss("cancel");
                                            };

                                            this.send = function () {
                                                this.loading.updating = true;
                                                $q.when(this.saveCallback({ value: this.data })).then(
                                                    function () {
                                                        $uibModalInstance.close(self.data);
                                                    },
                                                    function (err) {
                                                        if (/^This abbreviated/.test(err.data.message)) {
                                                            $scope.abbreviatedNumberForm.abbreviatedNumber.$setValidity("available", false);
                                                            Toast.error($translate.instant("telephony_abbreviated_numbers_not_free_error"));
                                                        } else {
                                                            Toast.error($translate.instant("telephony_abbreviated_numbers_save_error"));
                                                        }
                                                        $q.reject(err);
                                                    }
                                                ).finally(function () {
                                                    self.loading.updating = false;
                                                });
                                            };
                                        }
);
