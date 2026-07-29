(function() {
    "use strict";

    function gens_set_cookie(name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    //Javascript GET cookie parameter
    var $_GET = {};
    document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function() {
        function decode(s) {
            return decodeURIComponent(s.split("+").join(" "));
        }

        $_GET[decode(arguments[1])] = decode(arguments[2]);
    });

    // Get time var defined in woo backend
    var $time = parseInt(gens_raf.timee);
    //If raf is set, add cookie.
    if (typeof $_GET["raf"] !== "undefined" && $_GET["raf"] !== null) {
        gens_set_cookie("gens_raf", $_GET["raf"], $time);
    }
})();