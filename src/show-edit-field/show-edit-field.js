const componentName = 'showEditField';
const moduleName = 'show-edit-field';
// var angular = require('angular');
function ShowEditImportController() {
    let self = this;
    // console.log(this);
    // this.isMore = false;
    this.$onInit = function() {
        this.showInput = this.input;
    }
    this.showEdit = true;
    this.changeValue = function() {
        this.showEdit = !this.showEdit;
        this.input = this.showInput;    
    }
}


let app = angular.module(moduleName, []);

app.component(componentName, {
    template: require('html-loader!./show-edit-field.html'),
    controller: ShowEditImportController,
    controllerAs: 'self',
    bindings: {
        input: '=',
        brand: '@',
        isMore: '<'
    }
});
app.directive('focusMe', ['$timeout', '$parse', function ($timeout, $parse) {
    return {
        link: function (scope, element, attrs) {
            var model = $parse(attrs.focusMe);
            scope.$watch(model, function (value) {
                if (value === true) {
                    $timeout(function () {
                        element[0].focus();
                    });
                }
            });
        }
    };
}]);
exports.name = moduleName;