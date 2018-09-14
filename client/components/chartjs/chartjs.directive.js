angular.module('managerApp').directive('chartjs', Chart => ({
  restrict: 'A',
  scope: {
    chartjs: '=?',
  },
  bindToController: true,
  controllerAs: '$ctrl',
  templateUrl: 'components/chartjs/chartjs.html',
  link(scope, element, attrs, controller) {
    const canvas = element.find('canvas').get(0);
    canvas.id = _.uniqueId('chartjs');
    _.set(controller, 'ctx', canvas.getContext('2d'));
  },
  controller: function directiveController($scope) {
    const self = this;

    this.createChart = function (data) {
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      this.chartInstance = new Chart(this.ctx, data || this.chartjs);
      this.enableResetZoom = _.get(this.chartInstance, 'config.options.zoom.enabled') === true;
    };

    this.$onInit = function () {
      $scope.$watch('$ctrl.chartjs', (data) => {
        if (data) {
          self.createChart(data);
        }
      });

      $scope.$on('destroy', () => {
        if (self.chartInstance) {
          self.chartInstance.destroy();
        }
      });
    };
  },
}));
