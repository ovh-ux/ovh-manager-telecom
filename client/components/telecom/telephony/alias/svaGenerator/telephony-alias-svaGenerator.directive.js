angular.module("managerApp").directive("svaGenerator", function ($q, $translatePartialLoader, $translate, $timeout, SvaGeneratorConfig) {
    "use strict";

    function normalizeNumber (number) {
        if (angular.isString(number)) {
            var n = number.replace(/\s/g, "");
            if (n.indexOf("+33") === 0 && n.length === 12) {
                return "0" + n.slice(3);
            } else if (n.indexOf("0033") === 0 && n.length === 13) {
                return "0" + n.slice(4);
            } else if (n.indexOf("08") === 0 && n.length === 10) {
                return n;
            }
        }
        return null;
    }

    function getNumberType (n) {
        var prefix = parseInt(normalizeNumber(n).slice(0, 4), 10);
        if (prefix >= 800 && prefix <= 805) {
            return "free";
        } else if (prefix >= 806 && prefix <= 809) {
            return "common";
        } else if (prefix >= 810 && prefix <= 899) {
            return "pay";
        }
        return null;
    }

    function formatNumber (n, format) {
        switch (format) {
        case "0 8AB XXX XXX":
            return n[0] + " " + n.slice(1, 4) + " " + n.slice(4, 7) + " " + n.slice(7, 10);
        case "0 8AB XX XX XX":
            return n[0] + " " + n.slice(1, 4) + " " + n.slice(4, 6) + " " + n.slice(6, 8) + " " + n.slice(8, 10);
        case "0 8AB XX XXXX":
            return n[0] + " " + n.slice(1, 4) + " " + n.slice(4, 6) + " " + n.slice(6, 10);
        case "0 8AB XXXX XX":
            return n[0] + " " + n.slice(1, 4) + " " + n.slice(4, 8) + " " + n.slice(8, 10);
        case "08 AB XX XX XX":
            return n.slice(0, 2) + " " + n.slice(2, 4) + " " + n.slice(4, 6) + " " + n.slice(6, 8) + " " + n.slice(8, 10);
        default:
            return n;
        }
    }

    function loadImage (src) {
        return $q(function (resolve, reject) {
            var result = new Image();
            result.onload = function () {
                resolve(result);
            };
            result.error = function (err) {
                reject(err);
            };
            result.src = src;
        });
    }

    function drawCenteredAt (source, dest, center) {
        var ctx = dest.getContext("2d");
        var midx = Math.floor(source.width * 0.5);
        var midy = Math.floor(source.height * 0.5);
        ctx.drawImage(source, center[0] - midx, center[1] - midy);
    }

    function colorize (canvas, color) {
        var ctx = canvas.getContext("2d");
        var data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var i = 0;
        while (i < data.data.length) {
            data.data[i++] = color[0];
            data.data[i++] = color[1];
            data.data[i++] = color[2];
            i++;
        }
        ctx.putImageData(data, 0, 0);
        return canvas;
    }

    return {
        restrict: "E",
        scope: {
            number: "=",
            numberFormat: "=",
            width: "=",
            fill: "=",
            pricePerCall: "=",
            pricePerMinute: "="
        },
        templateUrl: "components/telecom/telephony/alias/svaGenerator/telephony-alias-svaGenerator.html",
        link: function (scope, element) {

            scope.invalidNumber = false;

            function loadAssets () {
                var fill = scope.fill || "gradient";
                var template = getNumberType(scope.number) + (fill ? "_" + fill : "") + ".png";
                return $q.all({
                    template: loadImage(scope.scale.assetsPath + template),
                    font: loadImage(scope.scale.assetsPath + "font.png"),
                    fontSmall: loadImage(scope.scale.assetsPath + "font_small.png"),
                    perCall: loadImage(scope.scale.assetsPath + "per_call.png"),
                    perMinute: loadImage(scope.scale.assetsPath + "per_min.png"),
                    noop: $timeout(angular.noop, 500)
                });
            }

            /**
             * Render the number and return the resulting canvas.
             * We are using a bitmap font because specification requires Arial bold which is copyrighted.
             */
            function renderNumber (number, fontImage, fontAdvance) {
                var result = document.createElement("canvas");
                var ctx = result.getContext("2d");
                var pos = 0; // current character position

                // compute canvas width
                result.width = _.reduce(number, function (sum, c) {
                    return sum + (c === " " ? Math.floor(fontAdvance * 0.5) : fontAdvance);
                }, 0);
                result.height = fontImage.height;

                // draw each characters of the number
                _.each(number, function (c) {
                    if (c < "0" || c > "9") {
                        if (c === "," || c === ".") {
                            ctx.drawImage(fontImage, fontAdvance * 10, 0, fontAdvance, fontImage.height,
                                          pos, 0, fontAdvance, fontImage.height);
                        }
                        pos += Math.floor(fontAdvance * 0.5);
                    } else {
                        var i = parseInt(c, 10);
                        ctx.drawImage(fontImage, fontAdvance * i, 0, fontAdvance, fontImage.height,
                                      pos, 0, fontAdvance, fontImage.height);
                        pos += fontAdvance;
                    }
                });

                return result;
            }

            function renderSva (number, assets) {
                var result = document.createElement("canvas");
                var ctx = result.getContext("2d");
                result.width = assets.template.width;
                result.height = assets.template.height;

                // draw template
                ctx.drawImage(assets.template, 0, 0);

                // draw number
                var formattedNumber = formatNumber(number, scope.numberFormat);
                var numberCanvas = renderNumber(formattedNumber, assets.font, scope.scale.fontAdvance);
                if (scope.fill !== "black") {
                    numberCanvas = colorize(
                        numberCanvas,
                        SvaGeneratorConfig.colors.rgb[getNumberType(scope.number)]
                    );
                }
                drawCenteredAt(numberCanvas, result, scope.scale.templateCenter[scope.fill]);

                var price = null;
                if (scope.pricePerCall > 0) {
                    price = {
                        value: parseFloat(Math.round(scope.pricePerCall * 100) / 100).toFixed(2),
                        type: "perCall"
                    };
                } else if (scope.pricePerMinute > 0) {
                    price = {
                        value: parseFloat(Math.round(scope.pricePerMinute * 100) / 100).toFixed(2),
                        type: "perMinute"
                    };
                }

                // draw price
                if (price) {
                    var priceCanvas = renderNumber(price.value + "", assets.fontSmall, scope.scale.fontSmallAdvance);
                    var pricePos = scope.scale.templatePricePosition[scope.fill];
                    priceCanvas = colorize(priceCanvas, [255, 255, 255]);
                    ctx.drawImage(priceCanvas, pricePos[0], pricePos[1]);
                    var priceSuffix = document.createElement("canvas");
                    var priceSuffixCtx = priceSuffix.getContext("2d");
                    priceSuffix.width = assets.perCall.width;
                    priceSuffix.height = assets.perCall.height;
                    priceSuffixCtx.drawImage(assets[price.type], 0, 0);
                    ctx.drawImage(colorize(priceSuffix, [255, 255, 255]),
                                  priceCanvas.width - (scope.scale.fontSmallAdvance / 2) + 2 + pricePos[0], pricePos[1]);
                }

                return result;
            }

            function refresh () {
                scope.invalidNumber = normalizeNumber(scope.number) === null;
                scope.invalidNumber |= getNumberType(scope.number) === null;
                if (!scope.invalidNumber) {
                    scope.isLoading = true;
                    element.find(".sva-container").empty();
                    scope.imageHref = null;
                    loadAssets().then(function (assets) {
                        var number = normalizeNumber(scope.number);
                        var image = renderSva(number, assets);
                        if (image) {
                            var elt = angular.element("<img/>")
                                .attr("src", image.toDataURL("image/png"))
                                .attr("width", image.width)
                                .attr("height", image.height);
                            element.find(".sva-container").append(elt);
                            scope.imageHref = image.toDataURL("image/png");
                        }
                    }).catch(function (err) {
                        scope.error = err;
                    }).finally(function () {
                        scope.isLoading = false;
                    });
                }
            }

            $translatePartialLoader.addPart("../components/telecom/telephony/alias/svaGenerator");
            $translate.refresh().then(function () {
                scope.scale = SvaGeneratorConfig.scale["14pt"];
                scope.$watchGroup(["number", "numberFormat", "fill", "pricePerCall", "pricePerMinute"], refresh);
            });
        }
    };
});
