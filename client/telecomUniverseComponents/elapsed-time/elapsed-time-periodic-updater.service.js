import _ from 'lodash';
import moment from 'moment';

export default /* @ngInject */ ($timeout, $http, $q) => {
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
      } if (pendingDeltaTime) {
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
};
