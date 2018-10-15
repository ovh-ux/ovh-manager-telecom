angular
  .module('managerApp')
  .controller('TelecomSmsGuidesCtrl', class TelecomSmsGuidesCtrl {
    constructor($translate, SmsMediator, ToastError, SMS_GUIDES) {
      this.$translate = $translate;
      this.SmsMediator = SmsMediator;
      this.ToastError = ToastError;
      this.constant = { SMS_GUIDES };
    }

    $onInit() {
      this.loading = {
        init: false,
      };
      this.guides = null;
      this.language = null;
      this.count = null;

      this.loading.init = true;
      return this.SmsMediator.initDeferred.promise.then(() => {
        this.guides = this.constant.SMS_GUIDES;
        if (localStorage['univers-selected-language']) {
          this.language = localStorage['univers-selected-language'].replace(/-.*$|_.*$/, '');
        } else if (navigator.language || navigator.userLanguage) {
          this.language = (navigator.language || navigator.userLanguage).replace(/-.*$|_.*$/, '');
        }
        this.injectTitleInUrl();
      }).catch((err) => {
        this.ToastError(err);
      }).finally(() => {
        this.loading.init = false;
      });
    }

    /**
     * Inject title in URL.
     */
    injectTitleInUrl() {
      if (_.has(this.guides, 'sections')) {
        _.forEach(this.guides.sections, (section) => {
          if (_.has(section, 'guides')) {
            _.forEach(section.guides, (guide) => {
              if (_.has(guide, ['url', this.language]) && _.isString(guide.label)) {
                guide.url[this.language] = guide.url[this.language].replace( // eslint-disable-line
                  '{title}',
                  _.snakeCase(this.$translate.instant(guide.label)),
                );
                this.count += 1;
              }
            });
          }
        });
      }
    }

    /**
     * Has guides helper.
     * @return {Boolean}
     */
    hasGuides() {
      return this.count > 0;
    }
  });
