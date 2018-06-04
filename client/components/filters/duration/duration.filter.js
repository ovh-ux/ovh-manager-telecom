angular.module('managerApp').filter('duration', (moment, $filter) => function (seconds) {
  if (_.isFinite(seconds)) {
    return $filter('date')(moment.unix(seconds).toDate(), 'HH:mm:ss', 'UTC');
  }
  return '-';
});

