import _ from 'lodash';

import template from './toast-message.html';

export default {
  template,
  controller(TucToast, $timeout) {
    'ngInject';

    const timestamp = (new Date()).getTime();

    this.hasNewMessages = false;

    this.messageTypes = [
      'error',
      'warning',
      'info',
      'success',
    ];

    this.updateMessages = (messages) => {
      // update messages timestamp
      const pendingMessages = _.filter(messages, m => !m.timestamp);

      if (pendingMessages.length) {
        this.hasNewMessages = true;
        $timeout(() => {
          this.hasNewMessages = false;
        }, 1000);
      }

      _.each(pendingMessages, (m) => {
        _.set(m, 'timestamp', timestamp);
      });
    };

    this.getMessagesByType = (type) => {
      const messages = TucToast.getMessagesByType(type);

      this.updateMessages(messages);

      // do not display old messages
      return _.filter(messages, m => m.timestamp >= timestamp);
    };

    this.getAllMessages = () => {
      const messages = TucToast.getMessages();

      this.updateMessages(messages);

      // do not display old messages
      return _.filter(messages, m => m.timestamp >= timestamp);
    };

    this.hasMessagesOfType = type => this.getMessagesByType(type).length > 0;

    this.clearMessage = message => TucToast.clearMessage(message);

    this.clearMessagesByType = type => TucToast.clearMessagesByType(type);
  },
};
