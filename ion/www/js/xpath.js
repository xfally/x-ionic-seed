(function() {
    'use strict';

    // Define all css, js file's path.
    // Note:
    // - All paths are related to root path `www`.
    // - Some libs do not have runable min-version or normal-version, then here just use runable version.
    var paths = {
        css: {
            lib: [],
            libMin: [],
            core: [
                'css/ionic.app.css'
            ],
            mod: []
        },
        js: {
            lib: [
                'lib/ionic/js/ionic.bundle.js'
            ],
            libMin: [
                'lib/ionic/js/ionic.bundle.min.js'
            ],
            core: [
                'js/app.js'
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

