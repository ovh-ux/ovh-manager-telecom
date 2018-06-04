angular.module('managerApp')
  .component('resiliationReason', {
    bindings: {
      resiliationReason: '=?',
      resiliationReasonFilter: '@',
      resiliationReasonModel: '=?',
      onChange: '&',
    },
    templateUrl: 'components/resiliation/resiliation-reason.component.html',
    controllerAs: 'ResiliationReasonCtrl',
    controller($uibModal) {
      const self = this;
      this.resiliationChoices = [
        { name: 'addressMove', caption: 'resiliation_choice_addressMove', needComment: false },
        { name: 'billingProblems', caption: 'resiliation_choice_billingProblems', needComment: false },
        { name: 'cessationOfActivity', caption: 'resiliation_choice_cessationOfActivity', needComment: false },
        { name: 'changeOfTerms', caption: 'resiliation_choice_changeOfTerms', needComment: false },
        { name: 'ftth', caption: 'resiliation_choice_ftth', needComment: false },
        { name: 'goToCompetitor', caption: 'resiliation_choice_goToCompetitor', needComment: false },
        {
          name: 'technicalProblems',
          caption: 'resiliation_choice_technicalProblems',
          needComment: false,
        },
        { name: 'other', caption: 'resiliation_choice_other', needComment: true },
      ];

      this.resiliationChoices = this.resiliationChoices.filter(elt => !self.resiliationReasonFilter || (self.resiliationReasonFilter.split(',').indexOf(elt.name) > -1));

      this.canResiliate = function () {
        if (self.resiliationReasonModel) {
          const model = _.find(self.resiliationChoices, { name: self.resiliationReasonModel.type });
          return (model.needComment && self.resiliationReasonModel.comment) || !model.needComment;
        }
        return false;
      };

      this.resiliate = function () {
        self.panel = false;
        self.onChange({
          ELEMENT: self.resiliationReason,
          SURVEY: self.resiliationReasonModel,
          ACCEPT: true,
        });
      };

      this.reject = function () {
        self.panel = false;
        self.onChange({
          ELEMENT: self.resiliationReason,
          SURVEY: self.resiliationReasonModel,
          ACCEPT: false,
        });
      };

      this.openConfirmation = function () {
        $uibModal.open({
          templateUrl: 'components/resiliation/resiliation.modal.html',
          controllerAs: 'ResiliationModelCtrl',
          controller(subject) {
            this.resiliation = { confirm: {} };
            this.subject = subject;
          },
          resolve: {
            subject() {
              return self.resiliationReason;
            },
          },
        }).result.then(
          () => {
            self.resiliate();
          },
          () => {
            self.reject();
          },
        );
      };
    },
  });
