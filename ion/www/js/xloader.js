(function() {
    'use strict';

    // Refer to https://docs.angularjs.org/guide/bootstrap
    window.name = 'NG_DEFER_BOOTSTRAP!';

    var paths = xpath.path4Product;
    var css = paths.css.lib.concat(paths.css.core);
    LazyLoad.css(css, function() {
        //console.log('xloader: css loaded.');
        var js = paths.js.lib.concat(paths.js.core);
        LazyLoad.js(js, function() {
            //console.log('xloader: js loaded.');

            // must make sure angular loaded!
            (function checkAngularLoad() {
                if (angular && angular.resumeBootstrap) {
                    angular.resumeBootstrap();
                } else {
                    setTimeout(checkAngularLoad, 100);
                }
            })();
        });
    });

})();

