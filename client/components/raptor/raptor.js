(function ($) {
    "use strict";

    // Raptor Vars
    var $raptor = $("<img/>", {
        id: "elRaptor",
        alt: "el raptor!"
    }).css({
        display: "none",
        position: "fixed",
        bottom: "-600px",
        right: 0,
        zIndex: 20
    });
    var $raptorShriek = $("<audio/>").attr({
        id: "elRaptorShriek",
        preload: "auto",
        autoplay: "autoplay",
        volume: 0.4
    });
    var imageLoaded = false;
    var soundLoaded = false;

    // Determine Entrance
    var kkeys = [];
    var konami = "38,38,40,40,37,39,37,39,66,65";

    $(window).bind("keydown.raptorz", function (e) {
        kkeys.push(e.keyCode);

        // limit array size to avoid consuming too much memory over time
        while (kkeys.length > 10) {
            kkeys.shift();
        }
        if (kkeys.toString() === konami) {

            var doAnimation = function () {
                $raptor.appendTo("body");
                $raptorShriek.appendTo("body");
                $raptorShriek[0].play();
                $raptor.show().animate({
                    bottom: 0
                }, function () {
                    $(this).animate({
                        bottom: "-20px"
                    }, 100, function () {
                        var offset = $(this).position().left + 400;
                        $(this).delay(300).animate({
                            right: offset
                        }, 2200, function () {
                            $raptor.css({
                                bottom: "-600px",
                                right: 0
                            });
                            $raptor.remove();
                            $raptorShriek.remove();
                        });
                    });
                });
            };

            $raptor.load(function () {
                imageLoaded = true;
                if (soundLoaded) {
                    doAnimation();
                }
            });

            $raptorShriek.on("canplaythrough", function () {
                soundLoaded = true;
                if (imageLoaded) {
                    doAnimation();
                }
            });

            $raptor.attr("src", "assets/images/raptor.gif");
            $raptorShriek.attr("src", $raptorShriek[0].canPlayType("audio/mpeg") ? "assets/sounds/raptor-sound.mp3" : "assets/sounds/raptor-sound.ogg");
        }
    });
})(jQuery);
