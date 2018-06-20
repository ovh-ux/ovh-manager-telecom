angular.module('smsMock', []);

angular.module('smsMock').run(($q, $httpBackend, SmsMediator) => {
  SmsMediator.initDeferred = $q.defer(); // eslint-disable-line

  // TODO : do it better :-)
  $httpBackend.whenGET(/\/2api\/.+/).respond(200, {});
  $httpBackend.whenGET(/\/apiv6\/.+/).respond(200, {});
});
