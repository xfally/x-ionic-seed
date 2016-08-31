(function() {
    'use strict';

    // Define all css, js file's path.
    // Note:
    // - All paths are related to root path `www`.
    // - Some libs do not have runable min-version or normal-version, then here just use runable version.
    var paths = {
        css: {
            lib: [
                'lib/angular-loading-bar/build/loading-bar.css',
                'lib/angular-toastr/dist/angular-toastr.css'
            ],
            libMin: [
                'lib/angular-loading-bar/build/loading-bar.min.css',
                'lib/angular-toastr/dist/angular-toastr.min.css'
            ],
            core: [
                'css/ionic.app.css'
            ],
            mod: []
        },
        js: {
            lib: [
                'lib/ionic/js/ionic.bundle.js',
                'lib/angular-loading-bar/build/loading-bar.js',
                'lib/angular-local-storage/dist/angular-local-storage.js',
                'lib/angular-messages/angular-messages.js',
                'lib/angular-mocks/angular-mocks.js',
                'lib/angular-toastr/dist/angular-toastr.tpls.js',
                'lib/angular-translate/angular-translate.js',
                'lib/angular-translate-loader-partial/angular-translate-loader-partial.js',
                'lib/async/dist/async.js',
                'lib/cryptojslib/rollups/md5.js',
                'lib/oclazyload/dist/ocLazyLoad.js'
            ],
            libMin: [
                'lib/ionic/js/ionic.bundle.min.js',
                'lib/angular-loading-bar/build/loading-bar.min.js',
                'lib/angular-local-storage/dist/angular-local-storage.min.js',
                'lib/angular-messages/angular-messages.min.js',
                'lib/angular-mocks/angular-mocks.js',
                'lib/angular-toastr/dist/angular-toastr.tpls.min.js',
                'lib/angular-translate/angular-translate.min.js',
                'lib/angular-translate-loader-partial/angular-translate-loader-partial.min.js',
                'lib/async/dist/async.min.js',
                'lib/cryptojslib/rollups/md5.js',
                'lib/oclazyload/dist/ocLazyLoad.min.js'
            ],
            core: [
                'js/app.js',
                'js/directives.js',
                'js/protocols.js',
                'js/utils.js'
            ],
            mod: [],
            test: []
        }
    };

    var xpath = {};

    // Get special path with `prefix`
    xpath.getPath = function(prefix) {
        if (typeof(prefix) !== 'string') {
            return paths;
        }
        // deep copy
        try {
            var paths2 = JSON.parse(JSON.stringify(paths));
        } catch (error) {
            return paths;
        }
        return (function addPrefix(path) {
            if (typeof(path) === 'string') {
                return prefix + path;
            } else if (typeof(path) === 'object') {
                for (var i in path) {
                    path[i] = addPrefix(path[i]);
                }
                return path;
            } else {
                return path;
            }
        })(paths2);
    }

    // path for unit-testing
    xpath.path4Test = xpath.getPath('www/');
    // path for product
    xpath.path4Product = xpath.getPath();

    // Establish the root object, `window` (`self`) in the browser, `global`
    // on the server, or `this` in some virtual machines. We use `self`
    // instead of `window` for `WebWorker` support.
    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;

    // Node.js
    if (typeof module === 'object' && module.exports) {
        module.exports = xpath;
    }
    // AMD / RequireJS
    else if (typeof define === 'function' && define.amd) {
        define([], function() {
            return xpath;
        });
    }
    // included directly via <script> tag
    else {
        root.xpath = xpath;
    }

})();

