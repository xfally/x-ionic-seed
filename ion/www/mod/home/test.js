// test case, for e.g. jasmine in the future.

describe('mod.home', function() {

    beforeEach(module('mod.home'));

    describe('homeCtrl', function() {

        var ctrl, scope;

        beforeEach(inject(function($controller, $rootScope) {
            scope = $rootScope.$new();
            ctrl = $controller('homeCtrl', {
                $scope: scope
            });
        }));

        it('controller should exist', function() {
            expect(ctrl).toBeDefined();
        });
    });
});

