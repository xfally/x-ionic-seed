(function() {
    'use strict';

    /**
     * @description
     * Protocol process module.
     *
     * Input and parse the protocol specification file (local or server), then output json object.
     *
     * @ngdoc overview
     * @name protocol
     */
    angular.module('protocol', [])

    /**
     * @description
     * Protocol constant.
     *
     * @memberof protocol
     */
    .constant('protocolConstant', {
        APP: {
            ID: 'io.github.xfally.ionic.starter',
            NAME: 'Starter',
            VER: '0.0.1'
        },
        PROTOCOL: {
            SPEC_NAME: '?',
            SPEC_VER: '?',
            SPEC_URL: '?'
        }
    })

    /**
     * @description
     * Protocol value.
     *
     * @memberof protocol
     */
    .value('protocolValue', {})

    /**
     * @description
     * Protocol specification service.
     *
     * Tip: This is just a demo, you can adjust it to your own communication protocol (json format).
     *
     * @memberof protocol
     * @ngdoc service
     * @name protocolSpecService
     * @requires $http
     * @requires $log
     */
    .factory('protocolSpecService', ['$http', '$log',
        function($http, $log) {
            /**
             * @description
             * Get protocol file (local or server) by url, and invoke parser to process.
             *
             * @memberof protocolSpecService
             * @param {string} url The protocol file url.
             * @param {function} parser The protocol parser function.
             * @param {string} field The protocol part/field name you want.
             * @param {function} callback The callback function, invoked with arg `{json-object} data` after parse.
             */
            var get = function(url, parser, field, callback) {
                $http.get(url)
                    .success(function(data, status, headers, config, statusText) {
                        parser(data, field, callback);
                        return;
                    })
                    .error(function(data, status, headers, config, statusText) {
                        $log.error('protocolSpecService:get(' + url + '): fail to get protocol file!');
                        return;
                    })
            }

            /**
             * @description
             * Parse protocol file, to get special field.
             *
             * @memberof protocolSpecService
             * @param {string} data The protocol (file) content (data).
             * @param {string} field The protocol part/field name you want.
             * @param {function} callback The callback function, invoked with arg `{json-object} data` after parse.
             */
            var parse = function(data, field, callback) {
                if (!data) {
                    return;
                }
                var regex = new RegExp(field + '$\n^(\{$\n(.*\n)*?^\})$\n', 'm');
                callback(angular.toJson(data.match(regex)[1]));
            }

            /**
             * @description
             * Get response field (in dntcase, it's "@EXPECT") as json obj.
             *
             * @memberof protocolSpecService
             * @param {string} url The protocol file url.
             * @param {function} callback The callback function, invoked with arg `{json-object} data` after parse.
             */
            var getFieldResponse = function(url, callback) {
                get(url, parse, "@EXPECT", callback);
            }

            return {
                get: get,
                parse: parse,
                getFieldResponse: getFieldResponse
            }
        }
    ])

    /**
     * @description
     * Protocol bundle.
     *
     * Bundle all protocols into one protocol.
     * Other module can depend on `protocolBundle` and use any API under it, like `protocolBundle.xxx.yyy()`.
     * Html can use `protocolBundle.xxx.yyy()` directly as it has been exported to `$rootScope`.
     *
     * @example
     * protocolBundle.protocolSpecService.getFieldResponse("dntcase/status/spec/case_status_action_0", function(resObj) {
     *     $scope.data.status = utilBundle.initUtil.initLoading(resObj);
     * });
     *
     * @memberof protocol
     * @ngdoc service
     * @name protocolBundle
     * @requires $rootScope
     * @requires protocolConstant
     * @requires protocolValue
     * @requires protocolSpecService
     */
    .factory('protocolBundle', ['$rootScope', '$window', 'protocolConstant', 'protocolValue', 'protocolSpecService',
        function($rootScope, $window, protocolConstant, protocolValue, protocolSpecService) {
            var api = {
                protocolConstant: protocolConstant,
                protocolValue: protocolValue,
                protocolSpecService: protocolSpecService
            }

            // Export service to html
            $rootScope.protocolBundle = api;
            // Export browser window
            $window.protocolBundle = api;
            return api;
        }
    ])

})();

