const moduleName = "editable";
const componentName = "editable";
export const name = moduleName;

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
        params: "<",
        editType: '<',
        minValue: '<',
        maxValue: '<'
    }
});
EditableController.$inject = ['$scope', '$element', '$timeout'];
function EditableController($scope, $element, $timeout) {
    let self = this;
    this.$onInit = function() {
    }
    this.focusMe = function() {
        if (!self.enabled) return;
        $scope.temp = self.getItemValue();
        $scope.editting = true;
        $timeout(() => {$element.find('form input')[0].focus();});
    }
    this.unfocusMe = function () {
        $timeout(() => {$element.find('form input')[0].blur();});
    }
    this.onBlur = function () {
        if (!self.enabled) return;
        self.setItemValue($scope.temp);
        $scope.editting = false;
    }
    this.handleEmptyString = function(value) {
        if (typeof value === 'string' && !value.length)
            return "[empty]";
        return value;
    }
    this.getItemValue = function() {
        if (typeof self.itemValue === 'function') {
            return self.itemValue(self.params);
        }
        return self.itemValue;
    }
    this.setItemValue = function(newVal) {
        if (self.editType === 'number' && !isNaN(self.minValue) && newVal < self.minValue) {
            let msg = `Min value is ${self.minValue}`;
            if (window.__toastr) window.__toastr.warning(msg);
            console.warn(msg);
            return;
        }
        if (self.editType === 'number' && !isNaN(self.maxValue) && newVal > self.maxValue) {
            let msg = `Max value is ${self.maxValue}`;
            if (window.__toastr) window.__toastr.warning(msg);
            console.warn(msg);
            return;
        }
        if ( typeof self.setValue === 'function')
            return self.setValue(self.params, newVal);
        if (typeof self.itemValue != 'function')
            return self.itemValue = newVal;
        return;
    }
}
