angular.module("managerApp").service("PackXdslModemMediator", function ($rootScope, $q, $translate, Xdsl, Poller) {
    "use strict";

    var self = this;

    this.capabilities = {
        canBeManagedByOvh: true
    };
    this.tasks = {};
    this.info = {};

    var pollModem = function (namespace, serviceName, callbackError) {
        function success (results) {
            self.capabilities = results.capabilities.data;

            // throw rising tasks
            _.forEach(results.current.data, function (state, key) {
                if (state && !self.tasks[key]) {
                    self.raiseTask(key, true, true);
                }
            });

            // throw falling tasks
            _.forEach(self.tasks, function (state, key) {
                if (state && !results.current.data[key]) {
                    self.raiseTask(key, false, true);
                }
            });
        }

        function error (err) {
            if (!_.isEmpty(err)) {
                callbackError(err);
            }
        }

        Xdsl.Modem().Aapi().poll(null, {
            xdslId: serviceName,
            namespace: namespace
        }).then(
            success,
            error,
            success
        );
    };

    this.setTask = function (name) {
        this.tasks[name] = true;
    };

    this.unsetTask = function (name) {
        delete this.tasks[name];
    };

    this.disableCapabilities = function () {
        this.capabilities = _.mapValues(this.capabilities, function (val, key) {
            if (key === "canBeManagedByOvh" || key === "canChangeMtu") {
                return val;
            }
            return false;
        });
    };

    this.raiseTask = function (name, state, byPassFlag) {
        $rootScope.$broadcast("pack_xdsl_modem_task_" + name, state);
        if (state) {
            this.setTask(name);
        } else {
            this.unsetTask(name);
        }
        if (!byPassFlag) {
            $rootScope.$broadcast("pack_xdsl_modem_task", self.tasks);
        }
    };

    this.open = function (serviceName, callbackError) {
        return Xdsl.Modem().Aapi().get({
            xdslId: serviceName
        }).$promise.then(function (data) {
            self.capabilities = data.capabilities;
            self.info = _.omit(data, ["capabilities"]);
            pollModem("packXdslModemTasks", serviceName, callbackError);
            return data;
        }).catch(function (err) {
            return $q.reject(err);
        });
    };

    this.close = function () {
        Poller.kill({
            namespace: "packXdslModemTasks"
        });
    };

});
