angular.module('managerApp').controller('XdslModemTemplateCtrl', class XdslModemTemplateCtrl {
  /* @ngInject */
  constructor($stateParams, $translate, $uibModal, OvhApiXdsl, TucPackXdslModemMediator,
    TucToast) {
    this.$stateParams = $stateParams;
    this.$translate = $translate;
    this.$uibModal = $uibModal;
    this.mediator = TucPackXdslModemMediator;
    this.OvhApiXdsl = OvhApiXdsl;
    this.templateName = null;
    this.TucToast = TucToast;
  }

  /*= =====================================
      =            INITIALIZATION            =
      ====================================== */
  $onInit() {
    return this.getModemTemplates();
  }
  /* -----  End of INITIALIZATION  ------*/

  getModemTemplates() {
    return this.OvhApiXdsl.TemplateModem().v6().query()
      .$promise.then((templateModemIds) => {
        this.modemTemplates = templateModemIds;
        return templateModemIds;
      }).catch(() => {
        this.modemTemplates = [];
      }).finally(() => {
        this.templateTmp = '';
        this.template = '';
      });
  }

  createModemTemplate() {
    this.message = {};
    return this.OvhApiXdsl.TemplateModem().v6().post({}, {
      name: this.templateName,
      serviceName: this.$stateParams.serviceName,
    }).$promise.then(() => {
      this.mediator.setTask('createModemTemplate');
      this.message = {
        type: 'success',
        detail: this.$translate.instant('xdsl_modem_template_creation_doing'),
      };
      this.templateName = null;
      this.getModemTemplates();
    }).catch((err) => {
      this.message = {
        type: 'error',
        detail: err.data.message.includes('TemplateName')
          ? this.$translate.instant('xdsl_modem_template_name_already_exist', { templateName: this.templateName })
          : this.$translate.instant('xdsl_modem_template_an_error_ocurred'),
      };
    });
  }

  applyTemplate() {
    if (_.isEmpty(this.$stateParams.serviceName)
            || !this.templateTmp) {
      this.templateTmp = this.template;
      this.TucToast.error(this.$translate.instant('xdsl_modem_template_an_error_ocurred'));
    }
    this.loading = true;
    return this.OvhApiXdsl.v6().applyTemplate(
      {
        xdslId: this.$stateParams.serviceName,
      },
      {
        templateName: this.templateTmp,
      },
    ).$promise.then(() => {
      this.mediator.disableCapabilities();
      this.mediator.setTask('applyTemplateModemConfig');
      this.template = this.templateTmp;
      this.TucToast.success(this.$translate.instant('xdsl_modem_template_apply_doing'));
    }).catch((err) => {
      this.templateTmp = this.template;
      this.TucToast.error([this.$translate.instant('xdsl_modem_template_an_error_ocurred'), _.get(err, 'data.message', '')].join(' '));
    }).finally(() => {
      this.loading = false;
    });
  }
});
