import asyncLoaderFactory from './async-loader.factory';

angular.module('managerApp', [
  'ovh-angular-sso-auth',
  'ovh-angular-sso-auth-modal-plugin',
  'angular-ellipses',
  'ovh-angular-timeline',
  'ovh-angular-ui-confirm-modal',
  'ng-at-internet',
  'atInternetUiRouterPlugin',
  'ovh-angular-contracts',
  'ngFlash',
  'ovh-ng-input-password',
  'ovh-jquery-ui-draggable-ng',
  'ovh-angular-sidebar-menu',
  'momentjs',
  'ovh-angular-mondial-relay',
  'ngAnimate',
  'ngCookies',
  'ngMessages',
  'ngResource',
  'ngSanitize',
  'ngAria',
  'ovh-api-services',
  'ovh-angular-checkbox-table',
  'ovh-ngStrap',
  'ovh-angular-tail-logs',
  'ovhPassword',
  'ovhPasswordStrengthBar',
  'ovhPasswordStrengthCheck',
  'ovhBrowserAlert',
  'ovh-angular-q-allSettled',
  'ovh-angular-simple-country-list',
  'ovh-angular-pagination-front',
  'pascalprecht.translate',
  'ovh-angular-responsive-tabs',
  'smoothScroll',
  'ovh-angular-swimming-poll',
  'tmh.dynamicLocale',
  'ovh-angular-otrs',
  'ui.bootstrap',
  'ui.router',
  'angular.uirouter.title',
  'ui.select',
  'ui.utils',
  'ui.calendar',
  'validation.match',
  'ovh-angular-apiv7',
  'ngCsv',
  'ovh-angular-line-diagnostics',
  'ovh-angular-input-number-spinner',
  'ovh-angular-contact',
  'ngPassword',
  'matchmedia-ng',
  'ui.sortable',
  'angular-inview',
  'oui',
  'ovh-angular-actions-menu',
  'ovh-angular-sidebar-menu',
  'angular-translate-loader-pluggable',
])

/*= =========  GLOBAL OPTIONS  ========== */
  .config((
    $urlRouterProvider, $locationProvider, $compileProvider, $logProvider,
    telecomConfig,
  ) => {
    $urlRouterProvider.otherwise('/');

    // $locationProvider.html5Mode(true);

    $compileProvider.debugInfoEnabled(telecomConfig.env !== 'prod');
    $logProvider.debugEnabled(telecomConfig.env !== 'prod');
  })

/*= =========  AUTHENTICATION  ========== */
  .config(($httpProvider, telecomConfig, ssoAuthenticationProvider) => {
    // --- configuration
    ssoAuthenticationProvider.setLoginUrl(telecomConfig.loginUrl);
    ssoAuthenticationProvider.setLogoutUrl(`${telecomConfig.loginUrl}?action=disconnect`);
    ssoAuthenticationProvider.setConfig([
      {
        serviceType: 'apiv6',
        urlPrefix: telecomConfig.apiRouteBase,
      },
      {
        serviceType: 'apiv7',
        urlPrefix: telecomConfig.apiv7RouteBase,
      },
      {
        serviceType: 'aapi',
        urlPrefix: telecomConfig.aapiRouteBase,
      },
      {
        serviceType: 'ws',
        urlPrefix: telecomConfig.wsRouteBase,
      },
    ]);

    $httpProvider.interceptors.push('ssoAuthInterceptor');
  })
  .config((LineDiagnosticsProvider) => {
    LineDiagnosticsProvider.setPathPrefix('/xdsl/{serviceName}');
  })

/*= =========  TRANSLATOR  ========== */
  .factory('asyncLoader', asyncLoaderFactory)
  .config((
    $translateProvider,
    LANGUAGES,
    tmhDynamicLocaleProvider,
    actionsMenuProvider,
    SidebarMenuProvider,
    translatePluggableLoaderProvider,
  ) => {
    // --- Translations configuration
    let defaultLanguage = 'fr_FR';

    if (localStorage['univers-selected-language']) {
      defaultLanguage = localStorage['univers-selected-language'];
    } else {
      localStorage['univers-selected-language'] = defaultLanguage;
    }

    $translateProvider.useLoader('translatePluggableLoader');

    translatePluggableLoaderProvider.useLoader('asyncLoader');

    // Check if language exist into the list
    const availableLangsKeys = _.pluck(LANGUAGES.available, 'key');

    if (availableLangsKeys.indexOf(defaultLanguage) === -1) {
      const languageSelected = defaultLanguage.split('_')[0];

      // We set default language
      defaultLanguage = LANGUAGES.default;

      // We check if there is the same lang but another country

      for (let j = availableLangsKeys.length - 1;
        j >= 0 && defaultLanguage === LANGUAGES.default;
        j -= 1) {
        const language = availableLangsKeys[j];

        if (/^(.*)_.*$/.test(language) && languageSelected === language.match(/^(.*)_.*$/)[1]) {
          defaultLanguage = language;
        }
      }
    }

    // set moment locale
    moment.locale(defaultLanguage.split('_')[0]);

    // set angular locale
    tmhDynamicLocaleProvider.localeLocationPattern('angular-i18n/angular-locale_{{locale}}.js');
    tmhDynamicLocaleProvider.defaultLocale(_.kebabCase(defaultLanguage));

    $translateProvider.useLoaderCache(true);
    $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
    $translateProvider.useMissingTranslationHandler('translateMissingTranslationHandler');
    $translateProvider.preferredLanguage(defaultLanguage);
    $translateProvider.use(defaultLanguage);

    $translateProvider.fallbackLanguage('fr_FR');
  })

/*= =========  PAGE TRACKING  ========== */
  .config((atInternetProvider, atInternetUiRouterPluginProvider, telecomConfig) => {
    const trackingEnabled = telecomConfig.env === 'prod';
    atInternetProvider.setEnabled(trackingEnabled);
    atInternetProvider.setDebug(!trackingEnabled);
    atInternetUiRouterPluginProvider.setTrackStateChange(trackingEnabled);
    atInternetUiRouterPluginProvider.addStateNameFilter(routeName => (routeName ? routeName.replace(/\./g, '::') : ''));
  })
  .run((atInternet, TRACKING, OvhApiMe) => {
    const config = TRACKING.atInternetConfiguration;

    atInternet.setDefaultsPromise(OvhApiMe.v6().get().$promise.then((me) => {
      config.nichandle = me.nichandle;
      config.countryCode = me.country;
      config.currencyCode = me.currency && me.currency.code;
      config.visitorId = me.customerCode;
      return config;
    }));
  })

/*= =========  INTERCEPT ERROR IF NO TRANSLATION FOUND  ========== */
  .factory('translateInterceptor', ($q) => {
    const regexp = new RegExp(/Messages\w+\.json$/i);
    return {
      responseError(rejection) {
        if (regexp.test(rejection.config.url)) {
          return {};
        }
        return $q.reject(rejection);
      },
    };
  })
  .factory('translateMissingTranslationHandler', $sanitize => function (translationId) {
    // Fix security issue: https://github.com/angular-translate/angular-translate/issues/1418
    return $sanitize(translationId);
  })

/*= =========  LOAD TRANSLATIONS  ========== */
  .config(($transitionsProvider, $httpProvider) => {
    $httpProvider.interceptors.push('translateInterceptor');

    $transitionsProvider.onBefore({}, (transition) => {
      transition.addResolvable({
        token: 'translations',
        deps: [],
        resolveFn: () => null,
      }); // transition.addResolvable
    }); // $transitionsProvider.onBefore
  })

/*= =========  CHECK IF STILL LOGGED IN  ========== */
  .run((ssoAuthentication, $transitions) => {
    ssoAuthentication.login().then(() => {
      $transitions.onStart({}, (transition) => {
        const next = transition.to();
        let authenticate;

        if (next.authenticate !== undefined) {
          authenticate = next.authenticate; // eslint-disable-line
        } else {
          authenticate = true;
        }

        if (authenticate) {
          ssoAuthentication.sessionCheckOrGoLogin();
        }
      });
    });
  })

/*= =========  LOAD NAVBAR AND SIDEBAR  ========== */
  .run(($document, $rootScope, ManagerNavbarService) => {
    // Get first base structure of the navbar, to avoid heavy loading
    ManagerNavbarService.getNavbar()
      .then((navbar) => {
        _.set($rootScope, 'navbar', navbar);

        // Then get the products links, to build the reponsive menu
        ManagerNavbarService.getResponsiveLinks()
          .then((responsiveLinks) => {
            _.set($rootScope, 'navbar.responsiveLinks', responsiveLinks);
          });
      });

    // Scroll to anchor id
    _.set($rootScope, 'scrollTo', (id) => {
      // Set focus to target
      $document[0].getElementById(id).focus();
    });
  })

  .config((OtrsPopupProvider, REDIRECT_URLS) => {
    OtrsPopupProvider.setBaseUrlTickets(_.get(REDIRECT_URLS, 'listTicket', null));
  })

  .config(($logProvider) => {
    $logProvider.debugEnabled(false);
  })

  .run((
    $transitions,
    $translate,
    $translatePartialLoader,
    ouiCriteriaAdderConfiguration,
    ouiDatagridConfiguration,
    ouiFieldConfiguration,
    ouiNavbarConfiguration,
    ouiPaginationConfiguration,
    ouiStepperConfiguration,
  ) => {
    $translatePartialLoader.addPart('common');
    $translatePartialLoader.addPart('components');

    const removeHook = $transitions.onSuccess({}, () => {
      _.set(ouiCriteriaAdderConfiguration, 'translations', {
        column_label: $translate.instant('common_criteria_adder_column_label'),
        operator_label: $translate.instant('common_criteria_adder_operator_label'),

        operator_boolean_is: $translate.instant('common_criteria_adder_operator_boolean_is'),
        operator_boolean_isNot: $translate.instant('common_criteria_adder_operator_boolean_isNot'),

        operator_string_contains: $translate.instant('common_criteria_adder_operator_string_contains'),
        operator_string_containsNot: $translate.instant('common_criteria_adder_operator_string_containsNot'),
        operator_string_startsWith: $translate.instant('common_criteria_adder_operator_string_startsWith'),
        operator_string_endsWith: $translate.instant('common_criteria_adder_operator_string_endsWith'),
        operator_string_is: $translate.instant('common_criteria_adder_operator_string_is'),
        operator_string_isNot: $translate.instant('common_criteria_adder_operator_string_isNot'),

        operator_number_is: $translate.instant('common_criteria_adder_operator_number_is'),
        operator_number_smaller: $translate.instant('common_criteria_adder_operator_number_smaller'),
        operator_number_bigger: $translate.instant('common_criteria_adder_operator_number_bigger'),

        operator_date_is: $translate.instant('common_criteria_adder_operator_date_is'),
        operator_date_isBefore: $translate.instant('common_criteria_adder_operator_date_isBefore'),
        operator_date_isAfter: $translate.instant('common_criteria_adder_operator_date_isAfter'),

        operator_options_is: $translate.instant('common_criteria_adder_operator_options_is'),
        operator_options_isNot: $translate.instant('common_criteria_adder_operator_options_isNot'),

        true_label: $translate.instant('common_criteria_adder_true_label'),
        false_label: $translate.instant('common_criteria_adder_false_label'),

        value_label: $translate.instant('common_criteria_adder_value_label'),
        submit_label: $translate.instant('common_criteria_adder_submit_label'),
      });

      _.set(ouiDatagridConfiguration, 'translations', {
        emptyPlaceholder: $translate.instant('common_datagrid_nodata'),
      });

      _.set(ouiFieldConfiguration, 'translations', {
        errors: {
          required: $translate.instant('common_field_error_required'),
          number: $translate.instant('common_field_error_number'),
          email: $translate.instant('common_field_error_email'),
          min: $translate.instant('common_field_error_min', { min: '{{min}}' }),
          max: $translate.instant('common_field_error_max', { max: '{{max}}' }),
          minlength: $translate.instant('common_field_error_minlength', { minlength: '{{minlength}}' }),
          maxlength: $translate.instant('common_field_error_maxlength', { maxlength: '{{maxlength}}' }),
          pattern: $translate.instant('common_field_error_pattern'),
        },
      });

      _.set(ouiNavbarConfiguration, 'translations', {
        notification: {
          errorInNotification: $translate.instant('common_navbar_notification_error_in_notification'),
          errorInNotificationDescription: $translate.instant('common_navbar_notification_error_in_notification_description'),
          markRead: $translate.instant('common_navbar_notification_mark_as_read'),
          markUnread: $translate.instant('common_navbar_notification_mark_as_unread'),
          noNotification: $translate.instant('common_navbar_notification_none'),
          noNotificationDescription: $translate.instant('common_navbar_notification_none_description'),
        },
      });

      _.set(ouiPaginationConfiguration, 'translations', {
        resultsPerPage: $translate.instant('common_pagination_resultsperpage'),
        ofNResults: $translate.instant('common_pagination_ofnresults')
          .replace('TOTAL_ITEMS', '{{totalItems}}'),
        currentPageOfPageCount: $translate.instant('common_pagination_currentpageofpagecount')
          .replace('CURRENT_PAGE', '{{currentPage}}')
          .replace('PAGE_COUNT', '{{pageCount}}'),
        previousPage: $translate.instant('common_pagination_previous'),
        nextPage: $translate.instant('common_pagination_next'),
      });
      _.set(ouiStepperConfiguration, 'translations', {
        optionalLabel: $translate.instant('common_stepper_optional_label'),
        modifyThisStep: $translate.instant('common_stepper_modify_this_step'),
        skipThisStep: $translate.instant('common_stepper_skip_this_step'),
        nextButtonLabel: $translate.instant('common_stepper_next_button_label'),
        submitButtonLabel: $translate.instant('common_stepper_submit_button_label'),
        cancelButtonLabel: $translate.instant('common_stepper_cancel_button_label'),
      });

      removeHook();
    });
  });
