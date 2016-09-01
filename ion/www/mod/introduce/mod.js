(function() {
    'use strict';

    /**
     * @description
     * Introduce is module that be shown at first time the app starts after installed or updated.
     *
     * @memberof mod
     * @ngdoc overview
     * @name mod.introduce
     * @requires service
     * @requires util
     * @requires protocol
     */
    angular.module('mod.introduce', ['service', 'util', 'protocol', 'mod.home'])

    .config(['$stateProvider', '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('introduce', {
                    url: '/introduce',
                    templateUrl: 'mod/introduce/mod.html',
                    controller: 'introduceCtrl'
                })
        }
    ])

    .controller('introduceCtrl', ['serviceBundle', 'utilBundle', 'protocolBundle', '$scope', 'homeValue',
        function(serviceBundle, utilBundle, protocolBundle, $scope, homeValue) {
            serviceBundle.modService.initMod($scope, {
                enter: enterCallback,
                beforeLeave: beforeLeaveCallback
            }, true);
            $scope.data = {
                local: {
                    images: {
                        walkthrough_bg_01: serviceBundle.modService.getModImgUrl('walkthrough_bg_01.png'),
                        walkthrough_01: serviceBundle.modService.getModImgUrl('walkthrough_01.png'),
                        walkthrough_bg_02: serviceBundle.modService.getModImgUrl('walkthrough_bg_02.png'),
                        walkthrough_02: serviceBundle.modService.getModImgUrl('walkthrough_02.png'),
                        walkthrough_bg_03: serviceBundle.modService.getModImgUrl('walkthrough_bg_03.png'),
                        walkthrough_03: serviceBundle.modService.getModImgUrl('walkthrough_03.png')
                    },
                },
                server: {},
                backup: {}
            };

            function enterCallback() {
                serviceBundle.linkService.preventAutoJumpWhenError();
                homeValue.preventNewcomerJump = true;
            }

            function beforeLeaveCallback() {
                serviceBundle.linkService.allowAutoJumpWhenError();
                homeValue.preventNewcomerJump = false;
            }
        }
    ])

})();

