angular.module("managerApp").service("telephonyGroupNumberConferencePolling", function ($q, $timeout) {
    "use strict";

    var self = this;
    var pollingDeferred = null;
    var pollingPromise = null;
    var pollingStarted = false;

    self.conference = null;

    /*= =========================================
    =            POLLING MANAGEMENT            =
    ==========================================*/

    function poll () {
        if (!pollingStarted) {
            return;
        }

        pollingPromise = $timeout(function () {
            return self.conference.getInfos();
        }, 1000).then(function () {
            pollingDeferred.notify();
            poll();
        }, function (error) {
            return pollingDeferred.reject(error);
        });
    }

    self.startPolling = function () {
        pollingStarted = true;
        return poll();
    };

    self.stopPolling = function () {
        pollingStarted = false;
        if (pollingPromise) {
            $timeout.cancel(pollingPromise);
        }
        pollingDeferred.reject();
    };

    self.pausePolling = function () {
        pollingStarted = false;
        if (pollingPromise) {
            $timeout.cancel(pollingPromise);
        }
    };

    /* -----  End of POLLING MANAGEMENT  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    /**
     *  Init and start conference polling
     */
    self.initPolling = function (conferenceObj) {
        // set conference instance to poll
        self.conference = conferenceObj;

        // set polling deferred
        pollingDeferred = $q.defer();

        // start polling
        self.startPolling();

        return pollingDeferred.promise;
    };

    /* -----  End of INITIALIZATION  ------*/

});
