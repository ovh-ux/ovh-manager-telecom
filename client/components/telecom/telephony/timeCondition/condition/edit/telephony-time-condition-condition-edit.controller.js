angular.module('managerApp').controller('voipTimeConditionConditionCtrl', function ($scope, $timeout) {
  const self = this;

  self.loading = {
    init: false,
  };

  self.popoverStatus = {
    move: false,
    rightPage: null,
  };

  self.model = {
    timeFrom: null,
    timeTo: null,
  };

  // From directive
  self.timeCondition = null;
  self.condition = null;
  self.fcEvent = null;

  // For controller
  self.maxFrom = null;
  self.activeSlot = null;
  self.overlapDetected = false;

  /*= ==============================
    =            HELPERS            =
    =============================== */

  function getActiveSlot() {
    return _.find(self.timeCondition.slots, {
      name: self.condition.policy,
    });
  }

  function refreshTime() {
    self.condition.timeFrom = moment(self.model.timeFrom).format('HH:mm:ss');
    self.condition.timeTo = moment(self.model.timeTo).subtract(1, 'second').format('HH:mm:ss');
  }

  self.isConditionValid = function () {
    // reset overlap status
    self.overlapDetected = false;

    // check if overlap an other condition on the same day
    const dayConditions = _.filter(self.timeCondition.conditions, condition =>
      condition.weekDay === self.condition.weekDay &&
      condition.conditionId !== self.condition.conditionId);
    const isConditionOverlap = _.some(dayConditions, (condition) => {
      const momentFrom = condition.getTimeMoment('from');
      const momentTo = condition.getTimeMoment('to');
      return (moment(self.model.timeFrom).isBetween(momentFrom, momentTo) || moment(self.model.timeTo).subtract(1, 'second').isBetween(momentFrom, momentTo)) && condition.state !== 'TO_DELETE';
    });
    if (isConditionOverlap) {
      self.overlapDetected = true;
      return false;
    }

    return true;
  };

  /* -----  End of HELPERS  ------*/

  /*= =============================
    =            EVENTS            =
    ============================== */

  /* ----------  Policy  ----------*/

  self.onPolicyBtnClick = function () {
    self.popoverStatus.move = true;
    self.popoverStatus.rightPage = 'policy';
  };

  self.onSlotTypeChange = function () {
    self.popoverStatus.move = false;
    self.activeSlot = getActiveSlot();
  };

  /* ----------  TimeFrom and TimeTo  ----------*/

  self.onTimeFromChange = function () {
    const timeToMoment = moment(self.model.timeTo);
    const isEndMidnight = timeToMoment.get('hour') === 0 && timeToMoment.get('minute') === 0;
    if (!isEndMidnight && self.model.timeFrom >= self.model.timeTo) {
      self.model.timeTo = moment(self.model.timeFrom).add(15, 'minute').toDate();
    }
    refreshTime();
  };

  self.onTimeToChange = function () {
    const timeToMoment = moment(self.model.timeTo);
    const isMidnight = timeToMoment.get('hour') === 0 && timeToMoment.get('minute') === 0;
    if (!isMidnight && self.model.timeFrom >= self.model.timeTo) {
      self.model.timeFrom = moment(self.model.timeTo).subtract(15, 'minute').toDate();
    }
    refreshTime();
  };

  /* ----------  Delete condition  ----------*/

  self.onDeleteConfirmBtnClick = function () {
    if (_.startsWith(self.condition.conditionId, 'tmp_')) {
      self.timeCondition.removeCondition(self.condition);
    } else {
      self.condition.state = 'TO_DELETE';
    }
    self.$onDestroy();
  };

  /* ----------  Footer actions  ----------*/

  self.onValidateBtnClick = function () {
    if (self.condition.state === 'DRAFT') {
      self.condition.state = 'TO_CREATE';
    }

    self.condition.stopEdition();

    if ($scope.$parent.$ctrl.onPopoverValidate) {
      $scope.$parent.$ctrl.onPopoverValidate(self.fcEvent);
    }
  };

  self.onCancelBtnClick = function () {
    self.$onDestroy();
  };

  self.onDeleteBtnClick = function () {
    self.popoverStatus.move = true;
    self.popoverStatus.rightPage = 'deleteConfirm';
  };

  /* -----  End of EVENTS  ------*/

  /*= =====================================
    =            INITIALIZATION            =
    ====================================== */

  self.$onInit = function () {
    self.loading.init = true;

    return $timeout(angular.noop, 99).then(() => {
      // set time condition instance from parent controller
      self.timeCondition = $scope.$parent.$ctrl.timeCondition;

      // set full calendar event from parent controller
      self.fcEvent = $scope.$parent.$ctrl.fcEventInEdition;

      // set currently edited condition instance from parent controller
      self.condition = $scope.$parent.$ctrl.conditionInEdition;

      // stop fc event edition - to avoid drag/drop and resize
      // self.fcEvent.editable = false;
      // set models
      // set time models
      self.model.timeFrom = self.condition.getTimeMoment('from').toDate();
      self.model.timeTo = self.condition.getTimeMoment('to').add(1, 'second').toDate();

      // set active condition slot
      self.activeSlot = getActiveSlot();

      // some helper
      self.maxFrom = moment(self.model.timeFrom).endOf('day').subtract({
        minute: 15,
      }).toDate();

      // call on popover init function if exist in parent ctrl
      if (_.isFunction($scope.$parent.$ctrl.onPopoverInit)) {
        $scope.$parent.$ctrl.onPopoverInit();
      }
    }).finally(() => {
      self.loading.init = false;
    });
  };

  self.$onDestroy = function () {
    if (self.condition.state === 'DRAFT') {
      self.timeCondition.removeCondition(self.condition);
    } else {
      self.condition.stopEdition(true);
    }

    if (_.isFunction($scope.$parent.$ctrl.onPopoverDestroy)) {
      $scope.$parent.$ctrl.onPopoverDestroy(self.fcEvent);
    }
  };

  /* -----  End of INITIALIZATION  ------*/
});
