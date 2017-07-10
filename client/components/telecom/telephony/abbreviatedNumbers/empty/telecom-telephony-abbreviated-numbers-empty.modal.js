angular.module("managerApp").controller("telecomTelephonyAbbreviatedNumbersEmptyModal",
                                        function ($scope, $q, $translate, $uibModalInstance, data) {
                                            "use strict";

                                            var self = this;

                                            this.loading = {
                                                updating: false
                                            };

                                            angular.extend(this, data);

                                            this.cancel = function () {
                                                $uibModalInstance.dismiss("cancel");
                                            };

                                            this.send = function () {
                                                this.removing = true;
                                                this.total = this.abbreviatedNumbers.length;
                                                this.progress = 0;
                                                return $q.all(
                                                    _.map(
                                                        self.abbreviatedNumbers,
                                                        function (elt) {
                                                            return $q.when(self.removeCallback({ value: elt })).finally(function () {
                                                                self.progress++;
                                                            });
                                                        }
                                                    )
                                                ).finally(function () {
                                                    $uibModalInstance.close();
                                                });
                                            };


                                        }
);
