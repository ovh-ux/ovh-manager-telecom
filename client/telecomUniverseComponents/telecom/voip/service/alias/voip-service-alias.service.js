import _ from 'lodash';

/**
 *  @ngdoc service
 *  @name managerApp.service:tucVoipServiceAlias
 *
 *  @requires $q provider
 *  @requires OvhApiMe        from ovh-api-services
 *  @requires OvhApiTelephony from ovh-api-services
 *  @requires voipServiceTask service
 *
 *  @description
 *  Service that manage specific API calls for aliases.
 */
export default class {
  constructor($q, OvhApiMe, OvhApiTelephony, voipServiceTask) {
    'ngInject';

    this.$q = $q;
    this.OvhApiMe = OvhApiMe;
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

  /**
   *  @ngdoc method
   *  @name managerApp.service:voipServiceAlias#fetchNumberSounds
   *  @methodOf managerApp.service:voipServiceAlias
   *
   *  @description
   *  <p>Fetch sounds available for a given number.</p>
   *
   *  @param  {VoipService} number (destructured) The given VoipService number.
   */
  fetchNumberSounds({ billingAccount, serviceName }) {
    return this.OvhApiTelephony.EasyHunting().Sound().v6().query({
      billingAccount,
      serviceName,
    }).$promise.then(soundIds => this.$q.all(
      soundIds.map(soundId => this.OvhApiTelephony.EasyHunting().Sound().v6().get({
        billingAccount,
        serviceName,
        soundId,
      }).$promise),
    ));
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:voipServiceAlias#fetchRedirectNumber
   *  @methodOf managerApp.service:voipServiceAlias
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
   *  @name managerApp.service:voipServiceAlias#fetchRedirectNumber
   *  @methodOf managerApp.service:voipServiceAlias
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
    }, { destination }).$promise.then(({ taskId }) => this.voipServiceTask
      .startPolling(
        billingAccount,
        serviceName,
        taskId,
        {
          namespace: `redirectChangeDestinationTask_${serviceName}`,
          interval: 1000,
          retryMaxAttempts: 0,
        },
      )).catch(error => error);
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:voipServiceAlias#fetchConferenceNumber
   *  @methodOf managerApp.service:voipServiceAlias
   *
   *  @description
   *  <p>Fetch conference number.</p>
   *
   *  @param  {VoipService} number (destructured) The given VoipService number.
   *
   *  @return {VoipService}                       The conference number
   */
  fetchConferenceNumber({ billingAccount, serviceName }) {
    return this.OvhApiTelephony.Conference().v6().settings({
      billingAccount,
      serviceName,
    }).$promise;
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:voipServiceAlias#updateConferenceNumberSettings
   *  @methodOf managerApp.service:voipServiceAlias
   *
   *  @description
   *  <p>Update settings of the conference number.</p>
   *
   *  @param  {VoipService} number (destructured) The given VoipService number.
   *  @param  {Object}      settings              New conference settings
   *
   */
  updateConferenceNumberSettings({ billingAccount, serviceName }, settings) {
    return this.OvhApiTelephony.Conference().v6().updateSettings({
      billingAccount,
      serviceName,
    }, settings).$promise;
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:voipServiceAlias#uploadConferenceNumberAnnounce
   *  @methodOf managerApp.service:voipServiceAlias
   *
   *  @description
   *  <p>Upload an announce file for the conference number.</p>
   *
   *  @param  {VoipService} number (destructured) The given VoipService number.
   *  @param  {Object}      file                  The new file to upload
   *
   */
  uploadConferenceNumberAnnounce({ billingAccount, serviceName }, file) {
    return this.OvhApiMe.Document().v6().upload(file.name, file)
      .then(({ id }) => this.OvhApiTelephony.Conference().v6().announceUpload({
        billingAccount,
        serviceName,
      }, { documentId: id }).$promise)
      .then(({ taskId }) => this.voipServiceTask
        .startPolling(
          billingAccount,
          serviceName,
          taskId,
          {
            namespace: `uploadConferenceNumberAnnounceTask_${serviceName}`,
            interval: 1000,
            retryMaxAttempts: 0,
          },
        ))
      .then(() => true)
      .catch(error => error);
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:voipServiceAlias#fetchConferenceNumberWebAccess
   *  @methodOf managerApp.service:voipServiceAlias
   *
   *  @description
   *  <p>Fetch conference number web access.</p>
   *
   *  @param  {VoipService} number (destructured) The given VoipService number.
   *
   *  @return {Array[Object]}                     The conference number web access
   */
  fetchConferenceNumberWebAccess({ billingAccount, serviceName }) {
    return this.OvhApiTelephony.Conference().WebAccess().v6()
      .query({
        billingAccount,
        serviceName,
      }).$promise
      .then(ids => this.$q.all(
        ids.map(id => this.OvhApiTelephony.Conference().WebAccess().v6().get({
          billingAccount,
          serviceName,
          id,
        }).$promise),
      ));
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:voipServiceAlias#createConferenceNumberWebAccess
   *  @methodOf managerApp.service:voipServiceAlias
   *
   *  @description
   *  <p>Create new web access for a conference number.</p>
   *
   *  @param  {VoipService} number (destructured) The given VoipService number.
   *  @param  {String}      type                  The type of the web access to create
   *
   *  @return {Object}                            The created web access
   */
  createConferenceNumberWebAccess({ billingAccount, serviceName }, type) {
    return this.OvhApiTelephony.Conference().WebAccess().v6().create({
      billingAccount,
      serviceName,
    }, { type }).$promise;
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:voipServiceAlias#deleteConferenceNumberWebAccess
   *  @methodOf managerApp.service:voipServiceAlias
   *
   *  @description
   *  <p>Delete a web access of the conference number.</p>
   *
   *  @param  {VoipService} number (destructured) The given VoipService number.
   *  @param  {String}      id                    Id of the web access to delete
   */
  deleteConferenceNumberWebAccess({ billingAccount, serviceName }, id) {
    return this.OvhApiTelephony.Conference().WebAccess().v6().remove({
      billingAccount,
      serviceName,
    }, id).$promise;
  }
}
