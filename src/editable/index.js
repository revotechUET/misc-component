const moduleName = "editable";
const componentName = "editable";
module.exports.name = moduleName;

var module = angular.module(moduleName, []);
module.component(componentName, {
    template: require('./template.html'),
    controller: EditableController,
    style: require('./style.css'),
    controllerAs: 'self',
    bindings:{
        itemValue: "<",
        itemLabel: "<",
        labelStyle: "<",
        contentStyle: "<"
    }
});

function EditableController($scope, $element, $timeout) {
    let self = this;
    console.log("editable initiated");
    this.$onInit = function() {
    }
    this.focusMe = function() {
        $timeout(() => {$element.find('form input')[0].focus();});
    }
    this.unfocusMe = function() {
        $timeout(() => {$element.find('form input')[0].blur();});
    }
}
