var moduleName = 'printSettings';
require('./style.less');
var componentName = 'printSettings';
module.exports.name = componentName;

var app = angular.module(moduleName, []);
app.component(componentName, {
    template: require('./template.html'),
    controller: printSettingsCtrl,
    controllerAs: 'self',
    bindings: {
        plotCtrl: "<",
    },
    transclude: true
});

function printSettingsCtrl($scope, $timeout, $element) {
    let self = this;
    
    this.$onInit = function () {
    }
}
