import ngTailLogs from '@ovh-ux/ng-tail-logs';
import ngUirouterTitle from '@ovh-ux/ng-uirouter-title';
import translateAsyncLoader from '@ovh-ux/translate-async-loader';
import telecomUniverseComponents from '@ovh-ux/telecom-universe-components';

import managerCore from '@ovh-ux/manager-core';
import managerFreefax from '@ovh-ux/manager-freefax';
import managerOverTheBox from '@ovh-ux/manager-overthebox';

angular.module('managerApp', [
  'angular-ellipses',
  'angular-inview',
  'angular-translate-loader-pluggable',
  'atInternetUiRouterPlugin',
  managerCore,
  managerFreefax,
  managerOverTheBox,
  'matchmedia-ng',
  'momentjs',
  'ng-at-internet',
  'ngAnimate',
  'ngAria',
  'ngCookies',
  'ngCsv',
  'ngFlash',
  'ngMessages',
  'ngOvhContracts',
  'ngPassword',
  'ngResource',
  'ngSanitize',
  ngTailLogs,
  ngUirouterTitle,
  'ovh-angular-actions-menu',
  'ovh-angular-apiv7',
  'ovh-angular-checkbox-table',
  'ovh-angular-contact',
  'ovh-angular-input-number-spinner',
  'ovh-angular-line-diagnostics',
  'ovh-angular-mondial-relay',
  'ovh-angular-otrs',
  'ovh-angular-pagination-front',
  'ovh-angular-q-allSettled',
  'ovh-angular-responsive-tabs',
  'ovh-angular-sidebar-menu',
  'ovh-angular-simple-country-list',
  'ovh-angular-sso-auth',
  'ovh-angular-sso-auth-modal-plugin',
  'ovh-angular-swimming-poll',
  'ovh-angular-timeline',
  'ovh-angular-ui-confirm-modal',
  'ovh-api-services',
  'ovhBrowserAlert',
  'ovh-jquery-ui-draggable-ng',
  'ovh-ng-input-password',
  'oui',
  'pascalprecht.translate',
  'smoothScroll',
  telecomUniverseComponents,
  translateAsyncLoader,
  'tmh.dynamicLocale',
  'ui.bootstrap',
  'ui.router',
  'ui.select',
  'ui.utils',
  'ui.calendar',
  'ui.sortable',
  'validation.match',
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
  .config((LineDiagnosticsProvider) => {
    LineDiagnosticsProvider.setPathPrefix('/xdsl/{serviceName}');
  })

/*= =========  TRANSLATOR  ========== */
  .config((
    TranslateServiceProvider,
  ) => {
    const defaultLanguage = TranslateServiceProvider.getUserLocale();
    // set moment locale
    moment.locale(defaultLanguage.split('_')[0]);
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
    ouiClipboardConfiguration,
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
      _.set(ouiClipboardConfiguration, 'translations', {
        copyToClipboardLabel: $translate.instant('common_clipboard_copy_to_clipboard'),
        copiedLabel: $translate.instant('common_clipboard_copied'),
        notSupported: $translate.instant('common_clipboard_not_supported'),
      });

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
