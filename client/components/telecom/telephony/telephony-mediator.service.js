angular.module("managerApp").service("TelephonyMediator", function ($q, $stateParams, OvhApiTelephony, TelephonyVoipService, REDIRECT_URLS, REDIRECT_V4_HASH) {
    "use strict";

    var self = this;
    var currentGroup = null;

    /* @TODO
     * groups "cache" is only used by findService function
     * we should refactor this one to use the generic getAll method
     * to get rid of the useless cache.
     */
    self.groups = {};
    self.getAllDeferred = null;
    self.apiScheme = null;

    self.getApiScheme = function () {
        if (!self.apiScheme) {
            return OvhApiTelephony.v6().schema().$promise.then(function (scheme) {
                self.apiScheme = scheme;
                return self.apiScheme;
            });
        }
        return $q.when(self.apiScheme);
    };

    /*= ===========================================
    =            V6 to V4 redirection            =
    ============================================*/

    self.getV6ToV4RedirectionUrl = function (constantPath) {
        var url = REDIRECT_URLS.telephonyV4 + _.get(REDIRECT_V4_HASH, constantPath);

        if ($stateParams.serviceName) {
            url = url.replace("{lineNumber}", $stateParams.serviceName);
        }
        return url.replace("{billingAccount}", $stateParams.billingAccount);
    };

    /* -----  End of V6 to V4 redirection  ------*/

    /* ------ Awesome code from perl -----------*/
    self.IsValidNumber = function (number) {
        return !!(
            number &&
            number.match(/^\+?(\d|\.| |#|-)+$/) &&
            number.length < 26 &&
            number.length > 2);
    };

    /*= =================================
    =            API MODELS            =
    ==================================*/

    self.getApiModels = function () {
        return OvhApiTelephony.v6().schema().$promise.then(function (schemas) {
            return schemas.models;
        });
    };

    self.getApiModelEnum = function (modelName) {
        return self.getApiModels().then(function (models) {
            return models[modelName].enum;
        });
    };

    /* -----  End of API MODELS  ------*/

    /*= ============================
    =            GROUP            =
    =============================*/

    /* ----------  SERVICES  ----------*/

    // @TODO refactor to use the getAll function instead of self.groups
    self.findService = function (serviceName) {
        var tmpGroup = null;
        var tmpService = null;

        for (var billingAccount in self.groups) {
            if (_.get(self.groups, billingAccount)) {
                tmpGroup = _.get(self.groups, billingAccount);
                tmpService = tmpGroup.getService(serviceName);
                if (tmpService) {
                    return tmpService;
                }
            }
        }
        return null;
    };

    self.getAll = function (force) {
        if (self.getAllDeferred && !force) {
            return self.getAllDeferred.promise;
        }
        self.getAllDeferred = $q.defer();
        TelephonyVoipService.fetchAll().then(function (groups) {
            self.groups = groups; // only because of findService function
            self.getAllDeferred.resolve(groups);
        }).catch(function (err) {
            self.getAllDeferred.reject(err);
        });
        return self.getAllDeferred.promise;
    };

    /* ----------  ACTIONS  ----------*/

    self.getGroup = function (billingAccount, force) {
        return self.getAll(force).then(function (groups) {
            return groups[billingAccount];
        });
    };

    /*
     * @TODO refactor, this should be useless now, just call getAll
     * with force attribute to have fresh data.
     */
    self.resetAllCache = function () {
        self.getAllDeferred = null;
        self.groups = {};
    };

    /* ----------  CURRENT GROUP  ----------*/

    self.setCurrentGroup = function (group) {
        currentGroup = group;
        return currentGroup;
    };

    self.getCurrentGroup = function () {
        return currentGroup;
    };

    /* -----  End of GROUP  ------*/

    /*= ======================================
    =            SIDEBAR HELPERS            =
    =======================================*/

    /* ----------  COUNT  ----------*/

    self.getCount = function (force) {
        return self.getAll(force).then(function (groups) {
            return _.keys(groups).length;
        });
    };

    /* -----  End of SIDEBAR HELPERS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    self.init = function (force) {
        return self.getAll(force).then(function (groups) {
            self.groups = groups; // only because of findService function
            return groups;
        });
    };

    /* -----  End of INITIALIZATION  ------*/

});
