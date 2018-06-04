angular.module('managerApp').service('jsPlumbService', function ($q) {
  const self = this;

  const jsPlumbReadyDefered = $q.defer();

  self.initJsPlumb = function () {
    jsPlumb.ready(() => {
      jsPlumbReadyDefered.resolve();
    });

    return jsPlumbReadyDefered.promise;
  };
});
