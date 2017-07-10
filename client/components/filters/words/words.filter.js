angular.module("managerApp").filter("words", function () {
    "use strict";

    return function (text, capitalizeFirstWord) {
        var words = _.words(text);

        if (capitalizeFirstWord) {
            for (var i = 0; i < words.length; i++) {
                if (i === 0) {
                    words[i] = _.capitalize(words[i]);
                } else {
                    words[i] = words[i].toLowerCase();
                }
            }
        }

        return words.join(" ");
    };
});
