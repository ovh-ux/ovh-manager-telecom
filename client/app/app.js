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
    "ovh-angular-manager-navbar",
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
    "ovh-common-style",
    "ovh-angular-checkbox-table",
    "ovh-angular-form-flat",
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
    "ovh-angular-toaster",
    "ovh-angular-toggleClass",
    "ovh-angular-otrs",
    "ui.bootstrap",
    "ui.router",
    "ui.router.title",
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
    "angular-inview"
])

/*= =========  GLOBAL OPTIONS  ==========*/
    .config(function ($urlRouterProvider, $locationProvider, $compileProvider, $logProvider, telecomConfig, ToastProvider) {
        "use strict";

        // Toaster
        ToastProvider.setExtraClasses("messenger-fixed messenger-on-bottom messenger-on-right");
        ToastProvider.setTheme("air");

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
    .config(function (atInternetProvider, atInternetUiRouterPluginProvider, telecomConfig, TRACKING) {
        "use strict";

        var trackingEnabled = telecomConfig.env === "prod";
        atInternetProvider.setEnabled(trackingEnabled);
        atInternetProvider.setDefaults(TRACKING.atInternetConfiguration);
        atInternetUiRouterPluginProvider.setTrackStateChange(trackingEnabled);
        atInternetUiRouterPluginProvider.addStateNameFilter(function (routeName) {
            return routeName ? routeName.replace(/\./g, "::") : "";
        });

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
    .config(function ($stateProvider, $httpProvider) {
        "use strict";

        $httpProvider.interceptors.push("translateInterceptor");

        $stateProvider.decorator("translations", function (state) {
            var routeOption = state.self;

            if (routeOption.translations) {

                var templateUrlTab = [];
                var translationsTab = routeOption.translations;

                if (routeOption.templateUrl) {
                    templateUrlTab.push(routeOption.templateUrl);
                }

                if (routeOption.views) {
                    angular.forEach(routeOption.views, function (value) {

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

                state.resolve.translations = ["$translate", "$translatePartialLoader", function ($translate, $translatePartialLoader) {
                    // load translation parts
                    angular.forEach(translationsTab, function (part) {
                        $translatePartialLoader.addPart(part);
                    });

                    return $translate.refresh();

                }];

                return translationsTab;

            }

            return null;
        });
    })

/*= =========  CHECK IF STILL LOGGED IN  ==========*/
    .run(function (ssoAuthentication, $rootScope) {
        "use strict";

        ssoAuthentication.login().then(function () {
            $rootScope.$on("$stateChangeStart", function (event, next) {
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
    .run(function (atInternet, managerNavbar, ssoAuthentication, $translate, $translatePartialLoader, $q, OtrsPopupService, User, $uibModal, MANAGER_URLS, REDIRECT_URLS, URLS, LANGUAGES) {
        "use strict";

        $translatePartialLoader.addPart("common");
        $translatePartialLoader.addPart("components");

        $q.allSettled([$translate.refresh(), User.Lexi().get().$promise]).then(function (data) {
            var user = data[1];

            var universKeys = [
                "portal", "web", "dedicated", "cloud", "telecom", "gamma", "partners"
            ];
            var universes = [];

            for (var i = 0; i < universKeys.length; i++) {
                universes.push({
                    universe: universKeys[i],
                    label: $translate.instant("common_menu_" + universKeys[i]),
                    url: MANAGER_URLS[universKeys[i]]
                });
            }

            universes.push({
                universe: "labs",
                icon: "fa fa-flask fs24 white",
                title: $translate.instant("common_menu_labs"),
                url: MANAGER_URLS.labs,
                click: function () {
                    atInternet.trackClick({
                        name: "uxlabs_chatbot_menu"
                    });
                    return true;
                }
            });

            managerNavbar.setExternalLinks(universes);

            managerNavbar.setInternalLinks([
                {
                    label: $translate.instant("common_menu_support_assistance"),
                    subLinks: [
                        {
                            label: $translate.instant("common_menu_support_all_guides"),
                            url: URLS.guides.home
                        }, {
                            label: $translate.instant("common_menu_support_new_ticket"),
                            click: function () {
                                if (!OtrsPopupService.isLoaded()) {
                                    OtrsPopupService.init();
                                } else {
                                    OtrsPopupService.toggle();
                                }
                            }
                        }, {
                            label: $translate.instant("common_menu_support_list_ticket"),
                            url: "#/support"
                        }, {
                            label: $translate.instant("common_menu_support_telephony_contact"),
                            url: URLS.support_contact
                        }, {
                            label: $translate.instant("common_menu_support_changelog"),
                            click: function () {
                                $uibModal.open({
                                    templateUrl: "app/changelog/changelog.html"
                                });
                            }
                        }
                    ]
                }, {
                    label: (function () {
                        var selectedLang;
                        if (localStorage["univers-selected-language"]) {
                            selectedLang = _.find(LANGUAGES.available, function (val) {
                                return val.key === localStorage["univers-selected-language"];
                            });
                        }
                        return selectedLang ? selectedLang.name : $translate.instant("common_menu_language");
                    })(),
                    subLinks: (function () {
                        var subLinksLang = [];
                        angular.forEach(LANGUAGES.available, function (lang) {
                            subLinksLang.push({
                                label: lang.name,
                                click: function () {
                                    localStorage["univers-selected-language"] = lang.key;
                                    window.location.reload();
                                },
                                lang: _.chain(lang.key).words().head().value()
                            });
                        });
                        return subLinksLang;
                    })()
                }, {
                    label: $translate.instant("common_menu_billing"),
                    url: REDIRECT_URLS.billing
                }, {
                    label: user.firstname + " " + user.name + " (" + user.nichandle + ")",
                    subLinks: [
                        {
                            label: $translate.instant("common_menu_account"),
                            url: REDIRECT_URLS.userInfos
                        }, {
                            label: $translate.instant("common_menu_billing"),
                            url: REDIRECT_URLS.billing
                        }, {
                            label: $translate.instant("common_menu_renew"),
                            url: REDIRECT_URLS.services
                        }, {
                            label: $translate.instant("common_menu_orders_all"),
                            url: REDIRECT_URLS.orders
                        }, {
                            label: $translate.instant("common_menu_orders"),
                            url: "#/orders"
                        }, {
                            label: $translate.instant("global_logout"),
                            click: function () {
                                ssoAuthentication.logout();
                            }
                        }
                    ]
                }
            ]);

            managerNavbar.setCurrentLink({
                universe: "telecom",
                label: $translate.instant("common_menu_telecom"),
                url: MANAGER_URLS.telecom
            });
        });
    })

    .config(function ($logProvider) {
        "use strict";

        $logProvider.debugEnabled(false);
    })

    .run(function ($rootScope, $title) {
        "use strict";

        $rootScope.$on("$stateChangeSuccess", function () {
            $rootScope.fullTitle = _.map($title.breadCrumbs(), "title").join(" &#62; ");
        });
    });
