import _ from 'lodash';

/**
 *  @ngdoc service
 *  @name managerApp.service:tucVoipServiceAlias
 *
 *  @requires $q provider
 *  @requires OvhApiTelephony from ovh-api-services
 *  @requires voipServiceTask service
 *
 *  @description
 *  Service that manage specific API calls for aliases.
 */
export default class {
  constructor($q, OvhApiTelephony, voipServiceTask) {
    'ngInject';

    this.$q = $q;
    this.OvhApiTelephony = OvhApiTelephony;
    this.voipServiceTask = voipServiceTask;
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:tucVoipServiceAlias#getConvertToLineTask
   *  @methodOf managerApp.service:tucVoipServiceAlias
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
   *  @name managerApp.service:tucVoipServiceAlias#changeNumberFeatureType
   *  @methodOf managerApp.service:tucVoipServiceAlias
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
   *  @name managerApp.service:tucVoipServiceAlias#editDescription
   *  @methodOf managerApp.service:tucVoipServiceAlias
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
   *  @name managerApp.service:tucVoipServiceAlias#isSpecialNumber
   *  @methodOf managerApp.service:tucVoipServiceAlias
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

  /**
   *  @ngdoc method
   *  @name managerApp.service:tucVoipServiceAlias#fetchRedirectNumber
   *  @methodOf managerApp.service:tucVoipServiceAlias
   *
   *  @description
   *  <p>Returns the redirect number properties.</p>
   *
   *  @param  {VoipService} number (destructured) The given VoipService number.
   *
   *  @return {VoipService} The redirect number
   */
  fetchRedirectNumber({ billingAccount, serviceName }) {
    return this.OvhApiTelephony.Redirect().v6().get({
      billingAccount,
      featureType: 'redirect',
      serviceName,
    }).$promise;
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:tucVoipServiceAlias#fetchRedirectNumber
   *  @methodOf managerApp.service:tucVoipServiceAlias
   *
   *  @description
   *  <p>Change the destination number, for a redirect number.</p>
   *
   *  @param  {VoipService} number (destructured) The given VoipService number.
   *  @param  {String}      destination           The number to redirect to
   *
   *  @return {Promise}     Polling change destination task that succeed once task is completed
   */
  changeDestinationRedirectNumber({ billingAccount, serviceName }, destination) {
    return this.OvhApiTelephony.Redirect().v6().change({
      billingAccount,
      featureType: 'redirect',
      serviceName,
    }, { destination }).$promise.then(task => this.voipServiceTask
      .startPolling(
        billingAccount,
        serviceName,
        task.taskId,
        {
          namespace: `redirectChangeDestinationTask_${serviceName}`,
          interval: 1000,
          retryMaxAttempts: 0,
        },
      )).catch(error => error);
  }
}
