import _ from 'lodash';
import moment from 'moment';

export default /* @ngInject */ $filter => function (seconds) {
  if (_.isFinite(seconds)) {
    return $filter('date')(moment.unix(seconds).toDate(), 'HH:mm:ss', 'UTC');
  }
  return '-';
};
