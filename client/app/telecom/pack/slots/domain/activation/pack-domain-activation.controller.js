angular.module("managerApp").controller("PackDomainActivationController", function ($scope, $stateParams, $translate, $q, $state, $timeout, OvhApiPackXdslDomainActivation, Toast, OvhApiMe, OvhSimpleCountryList) {
    "use strict";

    var self = this;

    function getUser () {
        return OvhApiMe.Lexi().get().$promise;
    }

    function loadAvailableTlds () {
        return OvhApiPackXdslDomainActivation.Lexi().getTlds({ packId: $scope.locker.packName }, function (data) {
            $scope.locker.tldList = [];
            _.each(data, function (elt) {
                $scope.locker.tldList.push({
                    value: elt,
                    label: "." + elt
                });
            });
            $scope.model.tld = _.first(data);
        }, function (err) {
            $scope.errors.push({
                key: "error_" + err.status,
                data: err.data
            });
        }).$promise;
    }

    function loadActivatedDomains () {
        return OvhApiPackXdslDomainActivation.Lexi().getServices({ packId: $scope.locker.packName }, function (data) {
            $scope.locker.activatedDomains = data;
        }, function (err) {
            $scope.errors.push({
                key: "error_" + err.status,
                data: err.data
            });
        }).$promise;
    }

    function init () {
        /* For errors */
        $scope.errors = [];

        /* Only for submitted data */
        $scope.model = {
            action: null, // Enum: [create | transfert | trade]
            authInfo: null,
            domain: null,
            tld: null
        };

        /* All data who should not be in the model (not submitted) */
        $scope.locker = {
            packName: null,
            tldList: [],
            activatedDomains: null,
            fqdn: null // Fully Qualified Domain Name (domain.tld)
        };

        /* State machine used to manipulate the view */
        $scope.toggles = {
            domainStatus: null,
            domainLoading: false,
            domainIsActivable: false,
            transfertWanted: false,
            authMethod: null
        };

        if (_.isEmpty($stateParams.packName)) {
            $scope.errors.push({
                key: "domain_activation_total_error"
            });
        } else {
            $scope.locker.packName = $stateParams.packName;
            $scope.locker.activatedDomains = [];
            $scope.errors = [];

            self.countries = OvhSimpleCountryList.asDataForSelect;

            self.isLoading = true;
            return $q.all([
                getUser(),
                loadActivatedDomains(),
                loadAvailableTlds()
            ]).finally(function () {
                self.isLoading = false;
            });
        }

        $scope.$watch("toggles.authMethod", function () {
            if ($scope.toggles.authMethod === "none") {
                $scope.model.noId = true;
            } else {
                $scope.model.noId = false;
            }
        });

        return $q.when(null);
    }

    var setDomainIsAvailable = function () {
        $scope.toggles.domainStatus = "available";
        $scope.model.action = "create";
    };

    var setDomainIsNotAvailable = function () {
        $scope.toggles.domainStatus = "unavailable";
        $scope.model.action = "transfer";
    };

    (function () {
        var to = null;
        $scope.scheduleCheckDomainDisponibility = function () {
            if (to) {
                $timeout.cancel(to);
            }
            to = $timeout($scope.checkDomainDisponibility, 800);
        };
    })();

    $scope.checkDomainDisponibility = function () {
        /* we have to reset some previous setting to avoid some strange… things */
        $scope.toggles.transfertWanted = false;
        $scope.toggles.domainStatus = null;
        $scope.toggles.authMethod = null;
        $scope.toggles.domainLoading = false;

        if (!$scope.model.domain) {
            $scope.locker.fqdn = null;
            return;
        }

        $scope.locker.fqdn = [$scope.model.domain, $scope.model.tld].join(".");

        if (~$scope.locker.activatedDomains.indexOf($scope.locker.fqdn)) {
            $scope.toggles.domainStatus = "alreadyActivated";
        } else {
            $scope.toggles.domainLoading = true;

            OvhApiPackXdslDomainActivation.Aapi().checkDisponibility({
                packId: $stateParams.packName,
                domain: $scope.model.domain,
                language: "fr"
            }, function (data) {
                // if the model still match the request
                if (data && data.domain === $scope.model.domain) {

                    if (!data.search) {
                        $scope.errors.push({
                            key: "error_417",
                            data: "Expectation Failed."
                        });
                        return;
                    }

                    setDomainIsNotAvailable();
                    _.each(data.search, function (search) {
                        if (search.available && search.tld === $scope.model.tld) {
                            setDomainIsAvailable();

                        }
                    });

                    // TODO: IF NOT $scope.toggles.domainStatus THEN ERROR !!
                }
                $scope.toggles.domainLoading = false;
            }, function (err) {
                var status;
                var message;

                if (err && err.status) {
                    status = err.status;

                    /* if the status of error is not set, it's probably a client side error */
                } else {
                    status = 456; // Unrecoverable Error
                }

                if (err && err.data) {
                    message = err.data; /* sever side error */
                } else if (err && err.message) {
                    message = err.message; /* client side error */
                } else {
                    message = "Unrecoverable Error";
                }

                $scope.toggles.domainLoading = false;
                $scope.errors.push({
                    key: "error_" + status,
                    data: message
                });
            });
        }
    };

    $scope.closeThisError = function (index) {
        if (index >= 0 && index < $scope.errors.length) {
            $scope.errors.splice(index, 1);
        }
    };

    $scope.toggleTransfertWanted = function () {
        $scope.toggles.transfertWanted = !$scope.toggles.transfertWanted;
    };

    $scope.submit = function () {
        var data = _.pick($scope.model, ["packName", "action", "authInfo", "domain", "tld"]);
        var toaster = Toast.infoWithInProgress(
            $translate.instant("domain_activation_please_wait"),
            $translate.instant("domain_activation_saving_domain"),
            { type: "info", hideAfter: false }
        );

        self.isActivating = true;
        OvhApiPackXdslDomainActivation.Lexi().postServices({
            packId: $scope.locker.packName
        }, data, function () {
            Toast.update(toaster, $translate.instant("domain_activation_domain_is_saved"),
                         { type: "success", hideAfter: 7 });

            $timeout(function () {
                $state.go("telecom.pack", {
                    packName: $stateParams.packName
                });
            }, 2000);

        }, function (err) {

            $scope.errors.push({
                key: "error_" + err.status,
                data: err.data
            });

            Toast.update(toaster, "(" + err.status + ") " +
                    $translate.instant("domain_activation_unable_to_save_domain"),
                         { type: "error", hideAfter: 10 }
            );
        }).$promise.finally(function () {
            self.isActivating = false;
        });
    };

    init();
});
