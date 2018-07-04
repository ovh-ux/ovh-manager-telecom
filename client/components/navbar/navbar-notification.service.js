class NavbarNotificationService {
  constructor($interval, $q, $translate, OvhApiNotificationAapi, TARGET, UNIVERSE) {
    this.$interval = $interval;
    this.$q = $q;
    this.$translate = $translate;
    this.OvhApiNotificationAapi = OvhApiNotificationAapi;
    this.TARGET = TARGET;
    this.UNIVERSE = UNIVERSE;

    this.NOTIFICATION_REFRESH_TIME = 60000;
  }

  getMessages() {
    return this.$translate.refresh().then(() => this.OvhApiNotificationAapi.query({
      lang: this.$translate.preferredLanguage(),
      target: this.TARGET,
      universe: this.UNIVERSE,
    }).$promise);
  }

  getSubLinks() {
    return this.getMessages()
      .then(messages => messages.map(message => this.convertSubLink(message)))
      .catch(() => undefined);
  }

  static _formatTime(dateTime) {
    return moment(dateTime).fromNow();
  }

  _toggleSublinkAction(toUpdate, linkClicked) {
    if (toUpdate.isActive && !toUpdate.updating) {
      _.set(toUpdate, 'updating', true);
      this.OvhApiNotificationAapi.post({ completed: [toUpdate.id] }).$promise.then(() => {
        _.set(toUpdate, 'isActive', false);
        _.set(toUpdate, 'acknowledged', true);
      }).finally(() => { _.set(toUpdate, 'updating', false); });
    } else if (!toUpdate.isActive && !toUpdate.updating && !linkClicked) {
      _.set(toUpdate, 'updating', true);
      this.OvhApiNotificationAapi.post({ acknowledged: [toUpdate.id] }).$promise.then(() => {
        _.set(toUpdate, 'isActive', true);
        _.set(toUpdate, 'acknowledged', true);
      }).finally(() => { _.set(toUpdate, 'updating', false); });
    }
  }

  convertSubLink(notification) {
    _.set(notification, 'time', this.constructor._formatTime(notification.date));
    _.set(notification, 'url', notification.urlDetails.href);
    _.set(notification, 'isActive', _.contains(['acknowledged', 'delivered'], notification.status));
    _.set(notification, 'acknowledged', _.contains(['acknowledged', 'completed', 'unknown'], notification.status));
    _.set(notification, 'actionClicked', toUpdate => this._toggleSublinkAction(toUpdate));
    _.set(notification, 'linkClicked', toUpdate => this._toggleSublinkAction(toUpdate, true));
    return notification;
  }

  acknowledgeAll() {
    if (this.navbarContent) {
      const toAcknowledge = this.navbarContent.subLinks
        .filter(subLink => !subLink.acknowledged && subLink.isActive);
      if (toAcknowledge.length) {
        this.OvhApiNotificationAapi
          .post({ acknowledged: toAcknowledge.map(x => x.id) }).$promise
          .then(() => {
            toAcknowledge.forEach((sublink) => {
              _.set(sublink, 'acknowledged', true);
            });
          });
      }
    }
  }

  _setRefreshTime(sublinks) {
    if (this.formatTimeTask) {
      this.$interval.cancel(this.formatTimeTask);
    }
    this.formatTimeTask = this.$interval(() => {
      sublinks.forEach((notification) => {
        _.set(notification, 'time', this.constructor._formatTime(notification.date));
      });
    }, this.NOTIFICATION_REFRESH_TIME);
  }

  getNavbarContent() {
    return this.getSubLinks().then((sublinks) => {
      this._setRefreshTime(sublinks);
      const navbarContent = {
        name: 'notifications',
        title: this.$translate.instant('common_navbar_notification_title'),
        iconClass: 'icon-notifications',
        limitTo: 10,
        onClick: () => this.acknowledgeAll(),
        subLinks: sublinks,
        show: true,
      };
      this.navbarContent = navbarContent;
      return navbarContent;
    });
  }
}

angular.module('managerApp').service('NavbarNotificationService', NavbarNotificationService);
