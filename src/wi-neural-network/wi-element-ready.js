const wiDirectiveName = 'wiElementReady';
// const moduleName = 'wi-element-ready';

let app = angular.module(wiDirectiveName, []);
app.directive(wiDirectiveName, ['$parse', function ($parse) {
    "ngInject";
    return {
        restrict: 'A',
        link: function ($scope, elem, attrs) {
            elem.ready(function () {
                $scope.$apply(function () {
                    let func = $parse(attrs[wiDirectiveName]);
                    func($scope);
                })
            })
        }
    }
}]);

export const name = wiDirectiveName;
