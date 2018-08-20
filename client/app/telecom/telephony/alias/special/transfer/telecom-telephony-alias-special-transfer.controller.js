angular.module('managerApp').controller('TelecomTelephonyAliasSpecialTransferCtrl', class TelecomTelephonyAliasSpecialTransferCtrl {
  constructor($filter, $q, $stateParams, OvhApiTelephonyService) {
    this.$filter = $filter;
    this.$q = $q;
    this.billingAccount = $stateParams.billingAccount;
    this.serviceName = $stateParams.serviceName;
    this.OvhApiTelephonyService = OvhApiTelephonyService;
  }

  $onInit() {
    this.notSupported = false;
    this.repayments = [];
    this.totalRepayment = {
      calls: 0,
      duration: 0,
      price: 0,
    };

    this.state = {
      orderBy: 'date',
      orderDesc: false,
    };
    this.isLoading = true;
    const decimalPrecision = 1000;

    return this.OvhApiTelephonyService.RepaymentConsumption().v6().query({
      billingAccount: this.billingAccount,
      serviceName: this.serviceName,
    }).$promise
      .then(repayments => this.$q.all(_.map(repayments,
        repayment => this.OvhApiTelephonyService.RepaymentConsumption().v6().get({
          billingAccount: this.billingAccount,
          serviceName: this.serviceName,
          consumptionId: repayment,
        }).$promise)))
      .then((result) => {
        _.map(result, (repayment) => {
          const newRepayment = repayment;
          newRepayment.price = Math.round(Math.abs(repayment.price) * decimalPrecision)
            / decimalPrecision;
          this.repayments.push(newRepayment);
        });
      }).finally(() => {
        this.totalRepayment.calls = this.repayments.length;
        this.totalRepayment.duration = _.reduce(this.repayments,
          (total, repayment) => total + repayment.duration, 0);
        this.totalRepayment.price = Math.round(_.reduce(this.repayments,
          (total, repayment) => total + repayment.price, 0) * decimalPrecision) / decimalPrecision;

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
