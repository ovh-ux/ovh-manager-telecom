/**
 * elapsedTime directive is a simple directive to display elapsed time in a human readable fashion.
 *
 * To update the display dynamically, a periodic timeout is called at a short time interval so the
 * displayed time in seconds is updated in real-time.
 *
 * To avoid creating a periodic timeout for EVERY directive, a service is used to SHARE the
 * periodic refreshing process between every elapsedTime directives. There are two benefits :
 *
 *   - angular loop is not called too many times because the refresh is called once for
 *     every elapsedTime directive
 *
 *   - elapsedTime directives are synced and updated at the same time : every directive is updated
 *     in a single angular loop
 */
angular.module('managerApp').service('ElapsedTimePeriodicUpdater', ($timeout, $http, $q) => {
  const toRefresh = [];
  let deltaTime = null;
  let pendingDeltaTime = null;

  function refreshPeriodically(delta) {
    _.each(toRefresh, (callback) => {
      callback(delta);
    });
    if (toRefresh.length) {
      $timeout(() => {
        refreshPeriodically(delta);
      }, 250);
    }
  }

  return {
    register(callback) {
      if (!_.find(toRefresh, callback)) {
        toRefresh.push(callback);
      }
      if (toRefresh.length === 1) {
        this.getDeltaTime().then((delta) => {
          refreshPeriodically(delta);
        });
      }
    },
    unregister(callback) {
      _.pull(toRefresh, callback);
    },
    getDeltaTime() {
      if (deltaTime !== null) {
        return $q.when(deltaTime);
      } else if (pendingDeltaTime) {
        return pendingDeltaTime;
      }
      pendingDeltaTime = $http.get('/auth/time').then((result) => {
        deltaTime = moment.unix(result.data).diff(moment(), 'seconds');
        return deltaTime;
      }).finally(() => {
        pendingDeltaTime = null;
      });
      return pendingDeltaTime;
    },
  };
}).directive('elapsedTime', (moment, $translatePartialLoader, $translate, $timeout, ElapsedTimePeriodicUpdater) => ({
  restrict: 'E',
  scope: {
    from: '=from',
  },
  template: "<span data-ng-bind='value'></span>",
  link(scope) {
    let isLoading = true;
    _.set(scope, 'value', '');

    function refresh(delta) {
      if (!isLoading) {
        const from = moment(scope.from).subtract(delta, 'seconds');
        const days = moment().diff(from, 'days');
        const hours = moment().diff(from, 'hours') - (24 * days);
        const minutes = moment().diff(from, 'minutes') - (days * 24 * 60) - (hours * 60);
        const seconds = moment().diff(from, 'seconds') - (days * 24 * 3600) - (hours * 3600) - (minutes * 60);

        if (days > 0) {
          _.set(scope, 'value', $translate.instant('elapsed_time_days', {
            days,
            hours,
          }));
        } else if (hours > 0) {
          _.set(scope, 'value', $translate.instant('elapsed_time_hours', {
            hours,
            minutes,
            seconds,
          }));
        } else if (minutes > 0) {
          _.set(scope, 'value', $translate.instant('elapsed_time_minutes', {
            minutes,
            seconds,
          }));
        } else {
          _.set(scope, 'value', $translate.instant('elapsed_time_seconds', {
            seconds,
          }));
        }
      }
    }

    // load translations
    $translatePartialLoader.addPart('../components/elapsed-time');
    $translate.refresh().then(() => {
      isLoading = false;
      ElapsedTimePeriodicUpdater.getDeltaTime().then((delta) => {
        refresh(delta);
      });
    });

    // refresh when model changes
    scope.$watch('from', () => {
      ElapsedTimePeriodicUpdater.getDeltaTime().then((delta) => {
        refresh(delta);
      });
    });

    ElapsedTimePeriodicUpdater.register(refresh);
    scope.$on('$destroy', () => {
      ElapsedTimePeriodicUpdater.unregister(refresh);
    });
  },
}));
