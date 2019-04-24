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
        setValue: "<",
        itemLabel: "<",
        labelStyle: "<",
        contentStyle: "<",
        enabled: "<",
        params: "<"
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
    this.getItemValue = function() {
        if (typeof self.itemValue === 'function') {
            return self.itemValue(self.params);
        }
        return self.itemValue;
    }
    this.setItemValue = function(newVal) {
        if ( typeof self.setValue === 'function') 
            return self.setValue(self.params, newVal);
        if (typeof self.itemValue != 'function') 
            return self.itemValue = newVal;
        return;
    }
}
