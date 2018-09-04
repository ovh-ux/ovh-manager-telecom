export default /* @ngInject */ function ($q) {
  const translations = {};

  const loader = function loader() {
    return $q.when(translations);
  };

  loader.addTranslations = function addTranslations(newTranslations) {
    return $q.when(Object.assign(translations, newTranslations));
  };

  return loader;
}
