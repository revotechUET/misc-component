const name = 'wiRightClick';

let app = angular.module(name, []);
app.directive(name, [function () {
    return {
        restrict: 'A',
        scope: {
            wiRightClick: '&'
        },
        link: function (scope, element, attrs) {
            element.on('contextmenu', function (event) {
                event.preventDefault();
                scope.$apply(function () {
                    scope.wiRightClick({ $event: event });
                });
            });
        }
    }
}]);

exports.name = name;