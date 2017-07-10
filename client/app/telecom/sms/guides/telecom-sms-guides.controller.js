angular.module("managerApp").controller("TelecomSmsGuidesCtrl", function ($translate, SmsMediator, ToastError, SMS_GUIDES) {
    "use strict";

    var self = this;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function injectTitleInUrl (guides, language) {
        if (_.has(guides, "sections")) {
            _.forEach(guides.sections, function (section) {
                if (_.has(section, "guides")) {
                    _.forEach(section.guides, function (guide) {
                        if (_.has(guide, ["url", language]) && _.isString(guide.label)) {
                            guide.url[language] = guide.url[language].replace(
                                "{title}",
                                _.snakeCase($translate.instant(guide.label))
                            );
                            self.count++;
                        }
                    });
                }
            });
        }
    }

    self.hasGuides = function () {
        return self.count > 0;
    };

    /* -----  End of HELPERS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading = {
            init: false
        };
        self.guides = null;
        self.language = null;
        self.count = null;

        self.loading.init = true;
        return SmsMediator.initDeferred.promise.then(function () {
            self.guides = SMS_GUIDES;

            if (localStorage["univers-selected-language"]) {
                self.language = localStorage["univers-selected-language"].replace(/\-.*$|_.*$/, "");
            } else if (navigator.language || navigator.userLanguage) {
                self.language = (navigator.language || navigator.userLanguage).replace(/\-.*$|_.*$/, "");
            }

            injectTitleInUrl(self.guides, self.language);
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
