angular.module('managerApp').component('telecomTelephonyAbbreviatedNumbers', {
  bindings: {
    abbreviatedNumbers: '=?',
    abbreviatedNumberPattern: '=?',
    loading: '=?',
    exportFilename: '=?',
    removeCallback: '&',
    insertCallback: '&',
    updateCallback: '&',
    reloadCallback: '&',
  },
  templateUrl: 'components/telecom/telephony/abbreviatedNumbers/telecom-telephony-abbreviated-numbers.html',
  controller($uibModal, $q, $stateParams, $translate, $timeout, Toast, PAGINATION_PER_PAGE) {
    const self = this;

    this.$onInit = function () {
      self.filter = {
        perPage: PAGINATION_PER_PAGE,
      };
      self.loading = {
        init: true,
      };
      self.abbreviatedNumbers = undefined;
    };

    /**
     * Remove an abbreviated number from the list
     * @param  {Object} abbreviatedNumber Full object
     * @return {Promise}
     */
    this.remove = function (abbreviatedNumber) {
      return $q.when(this.removeCallback({ value: abbreviatedNumber }))
        .then(() => {
          Toast.success($translate.instant('telephony_abbreviated_numbers_remove_success', abbreviatedNumber));
          const index = self.abbreviatedNumbers.indexOf(abbreviatedNumber);
          self.abbreviatedNumbers.splice(index, 1);
        })
        .catch((err) => {
          Toast.error($translate.instant('telephony_abbreviated_numbers_remove_error', abbreviatedNumber));
          return $q.reject(err);
        });
    };

    /**
     * Add a new abbreviated number
     */
    this.add = function () {
      const addModalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'components/telecom/telephony/abbreviatedNumbers/telecom-telephony-abbreviated-numbers.modal.html',
        controller: 'telecomTelephonyAbbreviatedNumbersModal',
        controllerAs: 'AbbreviatedNumberModal',
        resolve: {
          data() {
            return {
              // data: {},
              pattern: self.abbreviatedNumberPattern,
              saveCallback: self.insertCallback,
              title: $translate.instant('telephony_abbreviated_numbers_insert_title'),
            };
          },
        },
      });
      addModalInstance.result.then((data) => {
        self.abbreviatedNumbers.push(data);
        self.abbreviatedNumbers = _.sortBy(self.abbreviatedNumbers, elt =>
          parseInt(elt.abbreviatedNumber, 10));
      });
    };

    /**
     * Open the import dialog
     */
    this.openImport = function () {
      const importModalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'components/telecom/telephony/abbreviatedNumbers/import/telecom-telephony-abbreviated-numbers-import.modal.html',
        controller: 'telecomTelephonyAbbreviatedNumbersImportModal',
        controllerAs: 'AbbreviatedNumberModal',
        resolve: {
          data() {
            return {
              pattern: self.abbreviatedNumberPattern,
              saveCallback: self.insertCallback,
            };
          },
        },
      });
      importModalInstance.result.then((data) => {
        self.abbreviatedNumbers = _.sortBy(self.abbreviatedNumbers.concat(data), elt =>
          parseInt(elt.abbreviatedNumber, 10));
      });
      importModalInstance.result.catch(() => {
        self.reloadCallback();
      });
    };

    /**
     * Open the "Trash All" dialog
     */
    this.trashAll = function () {
      const importModalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'components/telecom/telephony/abbreviatedNumbers/empty/telecom-telephony-abbreviated-numbers-empty.modal.html',
        controller: 'telecomTelephonyAbbreviatedNumbersEmptyModal',
        controllerAs: 'AbbreviatedNumberModal',
        resolve: {
          data() {
            return {
              abbreviatedNumbers: self.abbreviatedNumbers,
              removeCallback: self.removeCallback,
            };
          },
        },
      });
      importModalInstance.result.then(() => {
        self.reloadCallback();
      });
      importModalInstance.result.catch(() => {
        self.reloadCallback();
      });
    };

    /**
     * Get the header line of the CSV
     */
    this.getCsvHeader = function () {
      return {
        abbreviatedNumber: $translate.instant('telephony_abbreviated_numbers_id'),
        destinationNumber: $translate.instant('telephony_abbreviated_numbers_number'),
        name: $translate.instant('telephony_abbreviated_numbers_name'),
        surname: $translate.instant('telephony_abbreviated_numbers_surname'),
      };
    };

    /**
     * Get the order of fields in the CSV
     */
    this.getCsvOrder = function () {
      return ['abbreviatedNumber', 'destinationNumber', 'name', 'surname'];
    };

    /**
     * Update an abbreviated number
     * @param  {Object} abbreviatedNumber Abbreviated number to update
     */
    this.update = function (abbreviatedNumber) {
      _.set(abbreviatedNumber, 'updating', true);
      const addModalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'components/telecom/telephony/abbreviatedNumbers/telecom-telephony-abbreviated-numbers.modal.html',
        controller: 'telecomTelephonyAbbreviatedNumbersModal',
        controllerAs: 'AbbreviatedNumberModal',
        resolve: {
          data() {
            return {
              data: angular.copy(abbreviatedNumber),
              readOnly: {
                abbreviatedNumber: true,
              },
              pattern: self.abbreviatedNumberPattern,
              saveCallback: self.updateCallback,
              title: $translate.instant('telephony_abbreviated_numbers_update_title'),
            };
          },
        },
      });
      addModalInstance.result.then((data) => {
        angular.extend(abbreviatedNumber, _.pick(data, ['name', 'surname', 'destinationNumber']));
      }).finally(() => {
        delete abbreviatedNumber.updating; // eslint-disable-line
      });
    };
  },
});
