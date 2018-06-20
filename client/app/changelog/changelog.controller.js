angular.module('managerApp')
  .controller('ChangelogCtrl', function (OvhApiChangelog, ToastError) {
    const self = this;

    self.content = null;

    OvhApiChangelog.Aapi().query().$promise.then(
      (content) => {
        self.content = content;
      },
      ToastError,
    );
  });
