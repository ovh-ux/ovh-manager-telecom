angular.module("managerApp", [
    "ovh-angular-sso-auth",
    "ovh-angular-sso-auth-modal-plugin",
    "angular-ellipses",
    "ovh-angular-timeline",
    "ovh-angular-ui-confirm-modal",
    "ng-at-internet",
    "atInternetUiRouterPlugin",
    "ovh-angular-contracts",
    "ngFlash",
    "ovh-ng-input-password",
    "ovh-jquery-ui-draggable-ng",
    "ovh-angular-sidebar-menu",
    "momentjs",
    "ovh-angular-mondial-relay",
    "ngAnimate",
    "ngCookies",
    "ngMessages",
    "ngResource",
    "ngSanitize",
    "ngAria",
    "ovh-api-services",
    "ovh-angular-checkbox-table",
    "ovh-ngStrap",
    "ovh-angular-tail-logs",
    "ovhPassword",
    "ovhPasswordStrengthBar",
    "ovhPasswordStrengthCheck",
    "ovhBrowserAlert",
    "ovh-angular-q-allSettled",
    "ovh-angular-simple-country-list",
    "ovh-angular-pagination-front",
    "pascalprecht.translate",
    "ovh-angular-responsive-tabs",
    "smoothScroll",
    "ovh-angular-swimming-poll",
    "tmh.dynamicLocale",
    "ovh-angular-otrs",
    "ui.bootstrap",
    "ui.router",
    "angular.uirouter.title",
    "ui.select",
    "ui.utils",
    "ui.calendar",
    "validation.match",
    "ovh-angular-apiv7",
    "ngCsv",
    "ovh-angular-line-diagnostics",
    "ovh-angular-input-number-spinner",
    "ovh-angular-contact",
    "ngPassword",
    "matchmedia-ng",
    "ui.sortable",
    "angular-inview",
    "angular-web-notification",
    "ngEmbed",
    "ovh-angular-user-pref",
    "ovh-angular-chatbot",
    "oui"
])

/*= =========  GLOBAL OPTIONS  ==========*/
    .config(function ($urlRouterProvider, $locationProvider, $compileProvider, $logProvider, telecomConfig) {
        "use strict";

        $urlRouterProvider.otherwise("/");

        // $locationProvider.html5Mode(true);

        $compileProvider.debugInfoEnabled(telecomConfig.env !== "prod");
        $logProvider.debugEnabled(telecomConfig.env !== "prod");
    })

/*= =========  AUTHENTICATION  ==========*/
    .config(function ($httpProvider, telecomConfig, ssoAuthenticationProvider) {
        "use strict";

        // --- configuration
        ssoAuthenticationProvider.setLoginUrl(telecomConfig.loginUrl);
        ssoAuthenticationProvider.setLogoutUrl(telecomConfig.loginUrl + "?action=disconnect");
        ssoAuthenticationProvider.setConfig([
            {
                serviceType: "apiv6",
                urlPrefix: telecomConfig.apiRouteBase
            },
            {
                serviceType: "apiv7",
                urlPrefix: telecomConfig.apiv7RouteBase
            },
            {
                serviceType: "aapi",
                urlPrefix: telecomConfig.aapiRouteBase
            },
            {
                serviceType: "ws",
                urlPrefix: telecomConfig.wsRouteBase
            }
        ]);

        $httpProvider.interceptors.push("ssoAuthInterceptor");
    })
    .config(function (LineDiagnosticsProvider) {
        "use strict";
        LineDiagnosticsProvider.setPathPrefix("/xdsl/{serviceName}");
    })

/*= =========  TRANSLATOR  ==========*/
    .config(function ($translateProvider, LANGUAGES, tmhDynamicLocaleProvider) {
        "use strict";

        // --- Translations configuration
        var defaultLanguage = "fr_FR";

        if (localStorage["univers-selected-language"]) {
            defaultLanguage = localStorage["univers-selected-language"];
        } else {
            localStorage["univers-selected-language"] = defaultLanguage;
        }

        // Check if language exist into the list
        var availableLangsKeys = _.pluck(LANGUAGES.available, "key");

        if (availableLangsKeys.indexOf(defaultLanguage) === -1) {
            var languageSelected = defaultLanguage.split("_")[0];

            // We set default language
            defaultLanguage = LANGUAGES.default;

            // We check if there is the same lang but another country

            for (var j = availableLangsKeys.length - 1; j >= 0 && defaultLanguage === LANGUAGES.default; j--) {
                var language = availableLangsKeys[j];

                if (/^(.*)_.*$/.test(language) && languageSelected === language.match(/^(.*)_.*$/)[1]) {
                    defaultLanguage = language;
                }
            }
        }

        // set moment locale
        moment.locale(defaultLanguage.split("_")[0]);

        // set angular locale
        tmhDynamicLocaleProvider.localeLocationPattern("bower_components/angular-i18n/angular-locale_{{locale}}.js");
        tmhDynamicLocaleProvider.defaultLocale(_.kebabCase(defaultLanguage));

        // define translation loader
        $translateProvider.useLoader("$translatePartialLoader", {
            urlTemplate: "app/{part}/translations/Messages_{lang}.json"
        });
        $translateProvider.useLoaderCache(true);
        $translateProvider.useSanitizeValueStrategy("sanitizeParameters");
        $translateProvider.useMissingTranslationHandler("translateMissingTranslationHandler");
        $translateProvider.preferredLanguage(defaultLanguage);
        $translateProvider.use(defaultLanguage);

        $translateProvider.fallbackLanguage("fr_FR");
    })

/*= =========  PAGE TRACKING  ==========*/
    .config(function (atInternetProvider, atInternetUiRouterPluginProvider, telecomConfig) {
        "use strict";

        var trackingEnabled = telecomConfig.env === "prod";
        atInternetProvider.setEnabled(trackingEnabled);
        atInternetProvider.setDebug(!trackingEnabled);
        atInternetUiRouterPluginProvider.setTrackStateChange(trackingEnabled);
        atInternetUiRouterPluginProvider.addStateNameFilter(function (routeName) {
            return routeName ? routeName.replace(/\./g, "::") : "";
        });

    })
    .run(function (atInternet, TRACKING, OvhApiMe) {
        "use strict";

        var config = TRACKING.atInternetConfiguration;

        atInternet.setDefaultsPromise(OvhApiMe.v6().get().$promise.then(function (me) {
            config.countryCode = me.country;
            config.currencyCode = me.currency && me.currency.code;
            config.visitorId = me.customerCode;
            return config;
        }));
    })

/*= =========  INTERCEPT ERROR IF NO TRANSLATION FOUND  ==========*/
    .factory("translateInterceptor", function ($q) {
        "use strict";

        var regexp = new RegExp(/Messages\w+\.json$/i);
        return {
            responseError: function (rejection) {
                if (regexp.test(rejection.config.url)) {
                    return {};
                }
                return $q.reject(rejection);
            }
        };
    })
    .factory("translateMissingTranslationHandler", function translateMissingTranslationHandler ($sanitize) {
        "use strict";
        return function (translationId) {
        // Fix security issue: https://github.com/angular-translate/angular-translate/issues/1418
            return $sanitize(translationId);
        };
    })

/*= =========  LOAD TRANSLATIONS  ==========*/
    .config(function ($transitionsProvider, $httpProvider) {
        "use strict";

        $httpProvider.interceptors.push("translateInterceptor");

        $transitionsProvider.onBefore({}, (transition) => {
            transition.addResolvable({
                token: "translations",
                deps: ["$translate", "$translatePartialLoader"],
                resolveFn: ($translate, $translatePartialLoader) => {
                    const state = transition.to();
                    if (state.translations) {

                        var templateUrlTab = [];
                        var translationsTab = state.translations;

                        if (state.templateUrl) {
                            templateUrlTab.push(state.templateUrl);
                        }

                        if (state.views) {
                            angular.forEach(state.views, function (value) {

                                if (_.isUndefined(value.noTranslations) && !value.noTranslations) {
                                    if (value.templateUrl) {
                                        templateUrlTab.push(value.templateUrl);
                                    }
                                    if (value.translations) {
                                        translationsTab = _.union(translationsTab, value.translations);
                                    }
                                }

                            });
                        }

                        angular.forEach(templateUrlTab, function (templateUrl) {
                            var routeTmp = templateUrl.substring(templateUrl.indexOf("/") + 1, templateUrl.lastIndexOf("/"));
                            var index = routeTmp.lastIndexOf("/");

                            while (index > 0) {
                                translationsTab.push(routeTmp);
                                routeTmp = routeTmp.substring(0, index);
                                index = routeTmp.lastIndexOf("/");
                            }

                            translationsTab.push(routeTmp);
                        });

                        // mmmhhh... It seems that we have to refresh after each time a part is added
                        translationsTab = _.uniq(translationsTab);

                        // load translation parts
                        angular.forEach(translationsTab, function (part) {
                            $translatePartialLoader.addPart(part);
                        });

                        return $translate.refresh();
                    }

                    return null;
                }
            }); // transition.addResolvable
        }); // $transitionsProvider.onBefore
    })

/*= =========  CHECK IF STILL LOGGED IN  ==========*/
    .run(function (ssoAuthentication, $transitions) {
        "use strict";

        ssoAuthentication.login().then(function () {
            $transitions.onStart({}, function (transition) {
                const next = transition.to();
                var authenticate;

                if (next.authenticate !== undefined) {
                    authenticate = next.authenticate;
                } else {
                    authenticate = true;
                }

                if (authenticate) {
                    ssoAuthentication.sessionCheckOrGoLogin();
                }
            });
        });
    })

/*= =========  LOAD NAVBAR AND SIDEBAR  ==========*/
    .run(function ($document, $rootScope, ManagerNavbarService) {
        "use strict";

        // Get first base structure of the navbar, to avoid heavy loading
        ManagerNavbarService.getNavbar()
            .then((navbar) => {
                $rootScope.navbar = navbar;

                // Then get the products links, to build the reponsive menu
                ManagerNavbarService.getResponsiveLinks()
                    .then((responsiveLinks) => {
                        $rootScope.navbar.responsiveLinks = responsiveLinks;
                    });
            });

        // Scroll to anchor id
        $rootScope.scrollTo = (id) => {
            // Set focus to target
            $document[0].getElementById(id).focus();
        };
    })

    .config(function (OtrsPopupProvider, REDIRECT_URLS) {
        OtrsPopupProvider.setBaseUrlTickets(_.get(REDIRECT_URLS, "listTicket", null));
    })

    .config(function ($logProvider) {
        "use strict";

        $logProvider.debugEnabled(false);
    })

    .run(($rootScope, $transitions, $translate, $translatePartialLoader,
          ouiDatagridConfiguration, ouiPaginationConfiguration, ouiFieldConfiguration) => {

        "use strict";
        $translatePartialLoader.addPart("common");
        $translatePartialLoader.addPart("components");

        const removeHook = $transitions.onSuccess({}, () => {
            ouiDatagridConfiguration.translations = {
                emptyPlaceholder: $translate.instant("common_datagrid_nodata")
            };

            ouiPaginationConfiguration.translations = {
                resultsPerPage: $translate.instant("common_pagination_resultsperpage"),
                ofNResults: $translate.instant("common_pagination_ofnresults")
                    .replace("TOTAL_ITEMS", "{{totalItems}}"),
                currentPageOfPageCount: $translate.instant("common_pagination_currentpageofpagecount")
                    .replace("CURRENT_PAGE", "{{currentPage}}")
                    .replace("PAGE_COUNT", "{{pageCount}}"),
                previousPage: $translate.instant("common_pagination_previous"),
                nextPage: $translate.instant("common_pagination_next")
            };

            ouiFieldConfiguration.translations = {
                errors: {
                    required: $translate.instant("common_field_error_required"),
                    number: $translate.instant("common_field_error_number"),
                    email: $translate.instant("common_field_error_email"),
                    min: $translate.instant("common_field_error_min", { min: "{{min}}" }),
                    max: $translate.instant("common_field_error_max", { max: "{{max}}" }),
                    minlength: $translate.instant("common_field_error_minlength", { minlength: "{{minlength}}" }),
                    maxlength: $translate.instant("common_field_error_maxlength", { maxlength: "{{maxlength}}" }),
                    pattern: $translate.instant("common_field_error_pattern")
                }
            };

            removeHook();
        });
    });
