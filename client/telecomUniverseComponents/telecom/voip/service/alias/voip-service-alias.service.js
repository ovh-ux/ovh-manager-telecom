import _ from 'lodash';

/**
 *  @ngdoc service
 *  @name managerApp.service:tucVoipServiceAlias
 *
 *  @requires $q provider
 *  @requires OvhApiMe        from ovh-api-services
 *  @requires OvhApiTelephony from ovh-api-services
 *  @requires tucVoipServiceTask service
 *
 *  @description
 *  Service that manage specific API calls for aliases.
 */
export default class {
  constructor($q, OvhApiMe, OvhApiTelephony, tucVoipServiceTask) {
    'ngInject';

    this.$q = $q;
    this.OvhApiMe = OvhApiMe;
    this.OvhApiTelephony = OvhApiTelephony;
    this.tucVoipServiceTask = tucVoipServiceTask;
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
      .then(task => this.tucVoipServiceTask
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
   *  @name managerApp.service:tucVoipServiceAlias#fetchNumberSounds
   *  @methodOf managerApp.service:tucVoipServiceAlias
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
   *  @name managerApp.service:tucVoipServiceAlias#fetchContactCenterSolutionNumber
   *  @methodOf managerApp.service:tucVoipServiceAlias
   *
   *  @description
   *  <p>Returns the contact center solution number properties.</p>
   *
   *  @param  {VoipService} number (destructured) The given VoipService number.
   *
   *  @return {VoipService}
   */
  fetchContactCenterSolutionNumber({ billingAccount, serviceName }) {
    return this.OvhApiTelephony.EasyHunting().v6().get({
      billingAccount,
      serviceName,
    }).$promise;
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:tucVoipServiceAlias#updateContactCenterSolutionNumber
   *  @methodOf managerApp.service:tucVoipServiceAlias
   *
   *  @description
   *  <p>Update the contact center solution number properties.</p>
   *
   *  @param  {VoipService} number (destructured) The given VoipService number.
   *
   *  @return {VoipService}
   */
  updateContactCenterSolutionNumber({ billingAccount, serviceName }, settings) {
    return this.OvhApiTelephony.EasyHunting().v6().change({
      billingAccount,
      serviceName,
    }, settings).$promise;
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:tucVoipServiceAlias#fetchContactCenterSolutionNumberQueues
   *  @methodOf managerApp.service:tucVoipServiceAlias
   *
   *  @description
   *  <p>Fetch current contact center solution existing queues.</p>
   *
   *  @param  {VoipService} number (destructured) The given VoipService number.
   *
   *  @return {Array[Object]}                     The queues list
   */
  fetchContactCenterSolutionNumberQueues({ billingAccount, serviceName }) {
    return this.OvhApiTelephony.EasyHunting().Hunting().Queue().v6()
      .query({
        billingAccount,
        serviceName,
      })
      .$promise.then(queueIds => this.$q.all(queueIds.map(
        queueId => this.OvhApiTelephony.EasyHunting().Hunting().Queue().v6()
          .get({
            billingAccount,
            serviceName,
            queueId,
          }).$promise,
      )));
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:tucVoipServiceAlias#fetchContactCenterSolutionNumberAgents
   *  @methodOf managerApp.service:tucVoipServiceAlias
   *
   *  @description
   *  <p>Fetch all agents of contact center solution number.</p>
   *
   *  @param  {VoipService} number (destructured) The given VoipService number.
   *
   *  @return {Array[Object]}                     The agents list
   */
  fetchContactCenterSolutionNumberAgents({ billingAccount, serviceName }) {
    return this.OvhApiTelephony.EasyHunting().Hunting().Agent().v6()
      .query({
        billingAccount,
        serviceName,
      }).$promise.then(agentIds => this.$q.all(
        _.chunk(agentIds, 50).map(chunkIds => this.OvhApiTelephony.EasyHunting().Hunting().Agent()
          .v6()
          .getBatch({
            billingAccount,
            serviceName,
            agentId: chunkIds,
          }).$promise),
      )).then(agents => _(agents).flatten().pluck('value').value());
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:tucVoipServiceAlias#fetchContactCenterSolutionNumberAgents
   *  @methodOf managerApp.service:tucVoipServiceAlias
   *
   *  @description
   *  <p>Fetch all agents lines of contact center solution number, with their queue order.</p>
   *
   *  @param  {VoipService} number (destructured) The given VoipService number.
   *  @param  {String}      queueId               Id of the concerned queue
   *
   *  @return {Array[Object]}                     The agents list
   */
  fetchContactCenterSolutionNumberAgentsInQueue({ billingAccount, serviceName }, queueId) {
    return this.fetchContactCenterSolutionNumberAgents({
      billingAccount,
      serviceName,
    }).then(agents => this.OvhApiTelephony.EasyHunting().Hunting().Queue().Agent()
      .v6()
      .getBatch({
        billingAccount,
        serviceName,
        queueId,
        agentId: _.pluck(agents, 'agentId'),
      }).$promise.then((queues) => {
        const orderedAgents = agents.map((agentParam) => {
          const agent = agentParam;
          const positionToSet = _(queues)
            .flatten()
            .pluck('value')
            .filter(queue => queue.agentId === agent.agentId)
            .first()
            .position;

          agent.position = positionToSet;
          return agent;
        });

        return _.sortBy(orderedAgents, 'position');
      }));
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:tucVoipServiceAlias#addContactCenterSolutionNumberAgentInQueue
   *  @methodOf managerApp.service:tucVoipServiceAlias
   *
   *  @description
   *  <p>Add a new agent line to the contact center solution number queue.</p>
   *
   *  @param  {VoipService} number (destructured) The given VoipService number.
   *  @param  {Object}      newAgent              Agent to create
   *  @param  {String}      queueId               Id of the existing queue
   */
  addContactCenterSolutionNumberAgentInQueue(
    { billingAccount, serviceName },
    newAgent,
    queueId,
  ) {
    return this.OvhApiTelephony.EasyHunting().Hunting().Agent()
      .v6()
      .create({
        billingAccount,
        serviceName,
      }, newAgent).$promise
      .then(({ agentId }) => this.OvhApiTelephony.EasyHunting().Hunting().Agent().Queue()
        .v6()
        .create({
          billingAccount,
          serviceName,
          agentId,
          queueId,
        }, { position: 0, queueId }).$promise);
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:tucVoipServiceAlias#updateContactCenterSolutionNumberAgent
   *  @methodOf managerApp.service:tucVoipServiceAlias
   *
   *  @description
   *  <p>Update a specific agent line of the contact center solution number.</p>
   *
   *  @param  {VoipService} number (destructured) The given VoipService number.
   *  @param  {String}      agentId               Id of the agent to update
   *  @param  {Object}      agentSettings         Settings of agent to update
   */
  updateContactCenterSolutionNumberAgent({ billingAccount, serviceName }, agentId, agentSettings) {
    return this.OvhApiTelephony.EasyHunting().Hunting().Agent()
      .v6()
      .change({
        billingAccount,
        serviceName,
        agentId,
      }, agentSettings).$promise;
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:tucVoipServiceAlias#updateContactCenterSolutionAgentPositionInQueue
   *  @methodOf managerApp.service:tucVoipServiceAlias
   *
   *  @description
   *  <p>Update the position of the agent line for a given contact center solution number.</p>
   *
   *  @param  {VoipService} number (destructured) The given VoipService number.
   *  @param  {Objet}       agent  (destructured) The agent to update
   *  @param  {Number}      queueIds              The id of related queue
   */
  updateContactCenterSolutionAgentPositionInQueue(
    { billingAccount, serviceName },
    { agentId, position },
    queueId,
  ) {
    return this.OvhApiTelephony.EasyHunting().Hunting().Queue().Agent()
      .v6()
      .change({
        billingAccount,
        serviceName,
        queueId,
        agentId,
      }, { position }).$promise;
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:tucVoipServiceAlias#deleteContactCenterSolutionNumberAgent
   *  @methodOf managerApp.service:tucVoipServiceAlias
   *
   *  @description
   *  <p>Delete a specific agent line of the contact center solution.</p>
   *
   *  @param  {VoipService} number (destructured) The given VoipService number.
   *  @param  {Number}      agentId               Id of the agent to delete
   */
  deleteContactCenterSolutionNumberAgent({ billingAccount, serviceName }, agentId) {
    return this.OvhApiTelephony.EasyHunting().Hunting().Agent().v6()
      .remove({
        billingAccount,
        serviceName,
        agentId,
      }).$promise;
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
    }, { destination }).$promise.then(({ taskId }) => this.tucVoipServiceTask
      .startPolling(
        billingAccount,
        serviceName,
        taskId,
        {
          namespace: `redirectChangeDestinationTask_${serviceName}`,
          interval: 1000,
          retryMaxAttempts: 0,
        },
      ));
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:tucVoipServiceAlias#fetchConferenceNumber
   *  @methodOf managerApp.service:tucVoipServiceAlias
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
   *  @name managerApp.service:tucVoipServiceAlias#updateConferenceNumberSettings
   *  @methodOf managerApp.service:tucVoipServiceAlias
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
   *  @name managerApp.service:tucVoipServiceAlias#uploadConferenceNumberAnnounce
   *  @methodOf managerApp.service:tucVoipServiceAlias
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
      .then(({ taskId }) => this.tucVoipServiceTask
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
      .then(() => true);
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:tucVoipServiceAlias#fetchConferenceNumberWebAccess
   *  @methodOf managerApp.service:tucVoipServiceAlias
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
   *  @name managerApp.service:tucVoipServiceAlias#createConferenceNumberWebAccess
   *  @methodOf managerApp.service:tucVoipServiceAlias
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
   *  @name managerApp.service:tucVoipServiceAlias#deleteConferenceNumberWebAccess
   *  @methodOf managerApp.service:tucVoipServiceAlias
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
