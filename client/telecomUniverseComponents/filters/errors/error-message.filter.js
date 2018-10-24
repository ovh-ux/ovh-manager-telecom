import _ from 'lodash';

export default () => function (err) {
  return _.get(err, 'data.value.message')
               || _.get(err, 'data.message')
               || _.get(err, 'statusText')
               || err;
};
