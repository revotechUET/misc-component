const componentName = 'showEditField';
const moduleName = 'show-edit-field';
function ShowEditImportController() {
    let self = this;
    this.$onInit = function() {
        this.isArray = Array.isArray(this.input);
    }
    this.changeValue = function(input,index) {
        this.showEdit[index] = !this.showEdit[index];
        this.input[index] = input;    
    }
}

let app = angular.module(moduleName, []);

app.component(componentName, {
    template: require('./show-edit-field.html'),
    controller: ShowEditImportController,
    controllerAs: 'self',
    bindings: {
        input: '=',
        brand: '@'
    }
});
app.directive('focusMe', function ($timeout, $parse) {
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
});
exports.name = moduleName;
