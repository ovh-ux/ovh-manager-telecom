module.exports = {
    "plugins": ["react"],
    "env": {
        "browser": true,
        "es6": true,
        "jquery": true,
        "jasmine": true,
        "mocha": true
    },
    "extends": "ovh",
    "rules": {
        "newline-per-chained-call": 0,
        "no-restricted-properties": [0, {
            "object": "Math",
            "property": "pow"
        }],
        "no-magic-numbers": 0,
        "no-underscore-dangle": 0,
        "prefer-arrow-callback": 0,
        "prefer-template": 0,
        "object-shorthand": 0
    },
    "globals": {
        "_": true,
        "$": true,
        "JSURL": true,
        "angular": true,
        "moment": true,
        "punycode": true,
        "URI": true,
        "ipaddr": true,
        "JustGage": true,
        "validator": true,
        "CSV": true,
        "jsPlumb": true,
        "jsPlumbUtil": true,
        "Raven": true
    }
};
