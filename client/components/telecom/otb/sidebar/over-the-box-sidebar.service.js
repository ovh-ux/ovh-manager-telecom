angular.module('managerApp').service('OverTheBoxSidebar', function ($q, $translate, SidebarMenu, OvhApiOverTheBox) {
  const self = this;

  self.mainSectionItem = null;

  /*= =======================================
    =            SUBITEMS LOADING            =
    ======================================== */

  self.loadOtbMainSection = function () {
    let requests = [];

    return OvhApiOverTheBox.v6().query().$promise.then((serviceNames) => {
      requests = _.map(serviceNames, serviceName => OvhApiOverTheBox.v6().get({
        serviceName,
      }).$promise);

      return $q.all(requests).then((overTheBoxDetails) => {
        _.forEach(overTheBoxDetails, (overTheBoxDetail) => {
          SidebarMenu.addMenuItem({
            title: overTheBoxDetail.customerDescription || overTheBoxDetail.serviceName,
            id: overTheBoxDetail.serviceName,
            state: 'telecom.overTheBox.details',
            stateParams: {
              serviceName: overTheBoxDetail.serviceName,
            },
          }, self.mainSectionItem);
        });
      });
    });
  };

  /* -----  End of SUBITEMS LOADING  ------*/

  /*= =====================================
    =            INITIALIZATION            =
    ====================================== */

  self.init = function () {
    self.mainSectionItem = SidebarMenu.addMenuItem({
      title: $translate.instant('telecom_sidebar_section_otb'),
      error: $translate.instant('telecom_sidebar_load_error'),
      id: 'telecom-otb-section',
      category: 'overTheBox',
      icon: 'ovh-font ovh-font-overTheBox',
      allowSubItems: true,
      onLoad: self.loadOtbMainSection,
      loadOnState: 'telecom.overTheBox',
    });

    return self.mainSectionItem;
  };

  /* -----  End of INITIALIZATION  ------*/
});
