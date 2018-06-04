angular.module('managerApp').constant('telecomConfig', {
  env: 'dev',
  aapiRouteBase: '/2api',
  apiRouteBase: '/apiv6',
  apiv7RouteBase: '/apiv7',
  wsRouteBase: '/ws',
  loginUrl: '/auth',
  cookieSessionName: 'APIV6_SESSION',
});
