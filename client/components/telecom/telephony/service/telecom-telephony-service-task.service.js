angular.module('managerApp').service('voipServiceTask', function ($q, Poller) {
  const self = this;

  /*= ==============================
    =            POLLING            =
    =============================== */

  self.startPolling = function (billingAccount, serviceName, taskId, pollOptions) {
    return Poller.poll(['/telephony', billingAccount, 'service', serviceName, 'task', taskId].join('/'), {
      cache: false,
    }, pollOptions).catch(err =>
    // Flag error
      $q.reject(_.extend(err, { type: 'poller' })));
  };

  self.stopPolling = function (pollingNamespage) {
    return Poller.kill({
      namespace: pollingNamespage,
    });
  };

  /* -----  End of POLLING  ------*/
});
