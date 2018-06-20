angular.module('managerApp').controller('XdslOrderFollowUpCtrl', function ($scope, $stateParams, OvhApiXdsl, $q, $translate, Toast, ToastError, ORDER_STATUS) {
  const self = this;

  this.loadData = function () {
    $q.all([
      // Get access Details
      OvhApiXdsl.v6().get({
        xdslId: self.xdslId,
      }, (access) => {
        self.access = access;
      }).$promise,

      // Get orders
      OvhApiXdsl.v6().getOrder({ xdslId: self.xdslId }, (data) => {
        let allSuccessTmp = true;
        data.forEach((elt) => {
          if (elt.status !== 'done') {
            allSuccessTmp = false;
          }
          const comments = elt.comments.map(thisComment => `<span>${thisComment}</span>`).join('');
          self.events.push({
            badgeClass: ORDER_STATUS[elt.status].class,
            badgeIconClass: ORDER_STATUS[elt.status].icon,
            name: elt.name,
            status: elt.status,
            when: elt.doneDate,
            contentHtml: comments,
            side: 'right',
          });
        });
        self.orderStatus = _.last(data).status;
        self.allSuccess = allSuccessTmp;
      }, (err) => {
        self.events = [];
        return new ToastError(err);
      }).$promise,
    ]).then(() => {
      self.loading = false;
    }, ToastError);
  };

  this.init = function () {
    self.events = [];
    self.loading = true;
    self.allSuccess = false;
    self.xdslId = $stateParams.serviceName;

    if (_.isEmpty(self.xdslId)) {
      return Toast.error($translate.instant('xdsl_order_follow_up_total_error'));
    }

    return self.loadData();
  };

  this.init();
});
