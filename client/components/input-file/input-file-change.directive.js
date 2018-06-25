angular.module('managerApp').directive('inputFileChange', () => ({
  restrict: 'A',
  scope: {
    change: '&inputFileChange',
  },
  link(tScope, tElement) {
    tElement.bind('change', () => {
      tScope.$apply(() => {
        const file = tElement.get(0).files[0];
        if (file) {
          tScope.change()(file);
        }
      });
    });
  },
}));
