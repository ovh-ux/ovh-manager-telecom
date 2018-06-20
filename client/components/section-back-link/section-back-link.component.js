(function () {
  angular.module('managerApp').component('sectionBackLink', {
    templateUrl: 'components/section-back-link/section-back-link.html',
    bindings: {
      toState: '@?sectionBackLinkToState',
      linkText: '@?sectionBackLinkTitle',
      onClick: '&?sectionBackLinkOnClick',
    },
  });
}());
