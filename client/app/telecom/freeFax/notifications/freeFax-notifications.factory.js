angular.module('managerApp').factory('FreeFaxNotificationObject', ($translate) => {
  const template = {
    email: '',
    type: 'simple',
    source: 'both',
  };

    /**
     * Object constructor
     * @param {Object} data Data from AAPI
     */
  const FreeFaxNotificationObject = function (data) {
    _.extend(
      this,
      template,
      _.pick(
        data,
        Object.keys(template),
      ),
    );
    this.inApi = data ? data.inApi : false;
  };

    /**
     * Cancel edit mode
     */
  FreeFaxNotificationObject.prototype.cancel = function () {
    this.toggleEdit(false);
    return this.inApi;
  };

  /**
     * Enter Edit Mode
     */
  FreeFaxNotificationObject.prototype.edit = function () {
    this.tempValue = _.pick(this, Object.keys(template));
    this.toggleEdit(true);
  };

  /**
     * Toggle edit mode
     * @param {Boolean} state [Optional] if set, for the edit mode state
     * @return {Boolean} new edit mode state
     */
  FreeFaxNotificationObject.prototype.toggleEdit = function (state) {
    if (_.isBoolean(state)) {
      this.editMode = state;
    } else {
      this.editMode = !this.editMode;
    }
    return this.editMode;
  };

  /**
     * Accept the editing values
     */
  FreeFaxNotificationObject.prototype.accept = function () {
    _.extend(this, this.tempValue);
    this.toggleEdit(false);
  };

  /**
     * Identifier
     */
  Object.defineProperty(FreeFaxNotificationObject.prototype, 'id', {
    get() {
      if (_.isEmpty(this.email)) {
        return null;
      }
      return _.snakeCase(this.email);
    },
    set: angular.noop,
  });

  /**
     * Identifier
     */
  Object.defineProperty(FreeFaxNotificationObject.prototype, 'translatedType', {
    get() {
      if (this.type) {
        return $translate.instant(`freefax_notification_type_${this.type}`);
      }
      return '-';
    },
    set: angular.noop,
  });

  return FreeFaxNotificationObject;
});
