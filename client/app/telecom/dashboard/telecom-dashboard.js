angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.dashboard', {
    url: '/',
    views: {
      'telecomView@telecom': {
        templateUrl: 'app/telecom/dashboard/telecom-dashboard.html',
        controller: 'TelecomDashboardCtrl',
        controllerAs: 'TelecomDashboardCtrl',
      },
      'billsView@telecom.dashboard': {
        templateUrl: 'app/telecom/dashboard/bills/telecom-dashboard-bills.html',
        controller: 'TelecomDashboardBillsCtrl',
        controllerAs: 'BillsCtrl',
        noTranslations: true,
      },
      'guidesView@telecom.dashboard': {
        templateUrl: 'app/telecom/dashboard/guides/telecom-dashboard-guides.html',
        controller: 'TelecomDashboardGuidesCtrl',
        controllerAs: 'GuidesCtrl',
        noTranslations: true,
      },
    },
    translations: ['common', 'telecom/dashboard'],
    resolve: {
      $title(translations, $translate) {
        return $translate('telecom_dashboard_page_title');
      },
      tracking(atInternet) {
        atInternet.trackPage({
          name: 'dashboard',
          type: 'navigation',
          level2: 'Telecom',
          chapter1: 'telecom',
        });
      },
    },
  });
});
