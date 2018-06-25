angular.module('managerApp').service('SmsSidebar', function ($translate, SidebarMenu, SmsMediator) {
  const self = this;

  self.mainSectionItem = null;

  /*= =======================================
    =            SUBITEMS LOADING            =
    ======================================== */

  self.loadSmsMainSection = function () {
    return SmsMediator.initAll().then((smsDetails) => {
      angular.forEach(smsDetails, (smsDetail) => {
        SidebarMenu.addMenuItem({
          id: smsDetail.name,
          title: smsDetail.description || smsDetail.name,
          state: 'telecom.sms.dashboard',
          stateParams: {
            serviceName: smsDetail.name,
          },
        }, self.mainSectionItem);
      });
    });
  };

  /* -----  End of SUBITEMS LOADING  ------*/

  /*= =====================================
    =            INITIALIZATION            =
    ====================================== */

  self.init = function () {
    self.mainSectionItem = SidebarMenu.addMenuItem({
      title: $translate.instant('telecom_sidebar_section_sms'),
      error: $translate.instant('telecom_sidebar_load_error'),
      id: 'telecom-sms-section',
      category: 'sms',
      icon: 'ovh-font ovh-font-message',
      allowSubItems: true,
      onLoad: self.loadSmsMainSection,
      loadOnState: 'telecom.sms',
    });

    return self.mainSectionItem;
  };

  /* -----  End of INITIALIZATION  ------*/
});
