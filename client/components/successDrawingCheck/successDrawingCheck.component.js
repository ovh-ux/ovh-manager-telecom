angular.module('managerApp').component('successDrawingCheck', {
  templateUrl: 'components/successDrawingCheck/successDrawingCheck.html',
  bindings: {
    drawSuccessCheck: '=',
  },
  transclude: true,
});
