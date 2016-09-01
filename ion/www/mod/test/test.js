// test case, for e.g. jasmine in the future.

describe('mod.test', function() {

    beforeEach(module('mod.home'));
    beforeEach(module('mod.test'));

    describe('testCtrl', function() {

        var ctrl, scope;

        beforeEach(inject(function($controller, $rootScope) {
            scope = $rootScope.$new();
            ctrl = $controller('testCtrl', {
                $scope: scope
            });
        }));

        it('controller should exist', function() {
            expect(ctrl).toBeDefined();
        });
    });

    describe('testDetailCtrl', function() {

        var ctrl, scope;

        beforeEach(inject(function($controller, $rootScope) {
            scope = $rootScope.$new();
            ctrl = $controller('testDetailCtrl', {
                $scope: scope
            });
        }));

        it('controller should exist', function() {
            expect(ctrl).toBeDefined();
        });
    });

    describe('testTemplateCtrl', function() {

        var ctrl, scope;

        beforeEach(inject(function($controller, $rootScope) {
            scope = $rootScope.$new();
            ctrl = $controller('testTemplateCtrl', {
                $scope: scope
            });
        }));

        it('controller should exist', function() {
            expect(ctrl).toBeDefined();
        });
    });
});

