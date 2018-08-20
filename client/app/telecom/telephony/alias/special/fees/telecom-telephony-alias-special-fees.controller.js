angular.module('managerApp').controller('TelecomTelephonyAliasSpecialFeesCtrl', class TelecomTelephonyAliasSpecialFeesCtrl {
  constructor($filter, $q, $stateParams, OvhApiTelephonyService) {
    this.$filter = $filter;
    this.$q = $q;
    this.billingAccount = $stateParams.billingAccount;
    this.serviceName = $stateParams.serviceName;
    this.OvhApiTelephonyService = OvhApiTelephonyService;
  }

  $onInit() {
    this.notSupported = false;
    this.fees = [];
    this.totalFee = {
      calls: 0,
      duration: 0,
      price: 0,
    };

    this.state = {
      orderBy: 'date',
      orderDesc: false,
    };

    this.isLoading = true;

    return this.OvhApiTelephonyService.RepaymentConsumption().v6().query({
      billingAccount: this.billingAccount,
      serviceName: this.serviceName,
    }).$promise
      .then(fees => this.$q.all(_.map(fees,
        fee => this.OvhApiTelephonyService.RepaymentConsumption().v6().get({
          billingAccount: this.billingAccount,
          serviceName: this.serviceName,
          consumptionId: fee,
        }).$promise)))
      .then((result) => {
        _.map(result, (fee) => {
          const newFee = fee;
          newFee.price = _.cell(Math.abs(fee.price), 3);
          this.fees.push(newFee);
        });
      }).finally(() => {
        this.totalFee.calls = this.fees.length;
        this.totalFee.duration = _.reduce(this.fees,
          (total, fee) => total + fee.duration, 0);
        this.totalFee.price = _.cell(_.reduce(this.fees,
          (total, fee) => total + fee.price, 0), 3);

        this.isLoading = false;
      });
  }

  applySorting() {
    let data = angular.copy(this.state.raw);
    data = this.$filter('orderBy')(
      data,
      this.state.orderBy,
      this.state.orderDesc,
    );
    this.state.sorted = data;
  }

  orderBy(by) {
    if (this.state.orderBy === by) {
      this.state.orderDesc = !this.state.orderDesc;
    } else {
      this.state.orderBy = by;
    }
    this.applySorting();
  }
});
