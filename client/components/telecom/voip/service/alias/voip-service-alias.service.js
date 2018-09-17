/**
 *  @ngdoc service
 *  @name managerApp.service:voipServiceAlias
 *
 *  @requires $q provider
 *  @requires OvhApiTelephony from ovh-api-services
 *  @requires voipServiceTask service
 *
 *  @description
 *  Service that manage specific API calls for aliases.
 */
angular.module('managerApp').service('voipServiceAlias', class voipServiceAlias {
  constructor($q, OvhApiTelephony, voipServiceTask) {
    this.$q = $q;
    this.OvhApiTelephony = OvhApiTelephony;
    this.voipServiceTask = voipServiceTask;
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:voipServiceAlias#getConvertToLineTask
   *  @methodOf managerApp.service:voipServiceAlias
   *
   *  @description
   *  <p>Get pending convertToLine task for a given number.</p>
   *
   *  @param  {VoipService} number (destructured) The given VoipService number.
   *
   *  @return {Object}  the pending convert to line task
   */
  getConvertToLineTask({ billingAccount, serviceName }) {
    return this.OvhApiTelephony.Service().OfferTask().v6()
      .query({
        billingAccount,
        serviceName,
        action: 'convertToSip',
        type: 'offer',
      }).$promise
      .then(offerTaskIds => this.$q
        .all(_.map(offerTaskIds, id => this.OvhApiTelephony.Service().OfferTask().v6().get({
          billingAccount,
          serviceName,
          taskId: id,
        }).$promise)).then(tasks => _.first(_.filter(tasks, { status: 'todo' }))));
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:voipServiceAlias#changeNumberFeatureType
   *  @methodOf managerApp.service:voipServiceAlias
   *
   *  @description
   *  <p>Change the feature type of a number.</p>
   *
   *  @param  {VoipService} number (destructured) The given VoipService number.
   *  @param  {String}      featureType The new type to apply
   *
   *  @return {Promise}     Polling change feature type task that succeed once task is completed
   */
  changeNumberFeatureType({ billingAccount, serviceName }, featureType) {
    return this.OvhApiTelephony.Number().v6()
      .changeFeatureType({
        billingAccount,
        serviceName,
      }, {
        featureType,
      }).$promise
      .then(task => this.voipServiceTask
        .startPolling(
          billingAccount,
          serviceName,
          task.taskId,
          {
            namespace: `numberChangeTypeTask_${serviceName}`,
            interval: 1000,
            retryMaxAttempts: 0,
          },
        ));
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:voipServiceAlias#editDescription
   *  @methodOf managerApp.service:voipServiceAlias
   *
   *  @description
   *  <p>Update the description of a number.</p>
   *
   *  @param  {VoipService} number (destructured) The given VoipService number.
   *
   *  @return {Promise} Promise of the edit
   */
  editDescription({ billingAccount, serviceName, description }) {
    return this.OvhApiTelephony.Number().v6().edit({
      billingAccount,
      serviceName,
    }, {
      description,
    }).$promise;
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:voipServiceAlias#isSpecialNumber
   *  @methodOf managerApp.service:voipServiceAlias
   *
   *  @description
   *  <p>Check if number is a special one.</p>
   *
   *  @param  {VoipService} number (destructured) The given VoipService number.
   *
   *  @return {Boolean}
   */
  isSpecialNumber({ billingAccount, serviceName }) {
    return this.OvhApiTelephony.Rsva().v6().getCurrentRateCode({
      billingAccount,
      serviceName,
    }).$promise.then(() => true)
      .catch(() => false);
  }
});
