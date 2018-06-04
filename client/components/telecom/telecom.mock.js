angular.module('telecomMock', []);

angular.module('telecomMock').run(($q, TelecomMediator) => {
  TelecomMediator.deferred = { // eslint-disable-line
    vip: $q.defer(),
    count: $q.defer(),
  };
});
