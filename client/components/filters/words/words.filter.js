angular.module('managerApp').filter('words', () => function (text, capitalizeFirstWord) {
  const words = _.words(text);

  if (capitalizeFirstWord) {
    for (let i = 0; i < words.length; i += 1) {
      if (i === 0) {
        words[i] = _.capitalize(words[i]);
      } else {
        words[i] = words[i].toLowerCase();
      }
    }
  }

  return words.join(' ');
});
