angular.module('managerApp').directive('jsplumbEndpoint', () => ({
  restrict: 'A',
  controller: 'jsplumbEndpointCtrl',
  bindToController: true,
  controllerAs: '$ctrl',
  require: ['^^jsplumb', 'jsplumbEndpoint'],
  scope: {
    options: '=jsplumbEndpoint',
    uuid: '@jsplumbEndpointUuid',
  },
  link: {
    pre(iScope, iElement, iAttrs, $ctrl) {
      const jsplumbCtrl = $ctrl[0];
      const endpointCtrl = $ctrl[1];

      endpointCtrl.endpoint = jsplumbCtrl.instance
        .addEndpoint(iElement, angular.extend(endpointCtrl.options || {}, {
          uuid: endpointCtrl.uuid,
        }));

      iScope.$watch('$ctrl.uuid', (newUuid, oldUuid) => {
        if (oldUuid && oldUuid !== newUuid) {
          // remove endpoint and connections associated
          jsplumbCtrl.instance.deleteEndpoint(endpointCtrl.endpoint);

          // recreate endpoint
          endpointCtrl.endpoint = jsplumbCtrl.instance
            .addEndpoint(iElement, angular.extend(endpointCtrl.options || {}, {
              uuid: newUuid,
            }));
        }
      });
    },
  },
}));
