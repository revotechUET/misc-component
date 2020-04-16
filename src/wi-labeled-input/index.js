var componentName = 'wiLabeledInput';

export const name = componentName;

require('./style.less');

var app = angular.module(componentName, ['editable', 'wiDropdownList']);

app.component(componentName, {
    template: require('./template.html'),
    controller: wiLabeledInputController,
    controllerAs: 'self',
    bindings: {
        title: '<',
        maxHeight: '<',
        dropList: '<',
        intData: "<",
        param: '<',
        onLabelChange: '<',
        editType: '<'
    }
});

function wiLabeledInputController() {
    let self = this;
    this.value = "3434";
    this.$onInit = function () {
        console.log(self.dropList);
        console.log(self.intData);
    }
    this.getItemValue = function () {
        return self.intData.value;
    }
    this.setItemValue = function (notUse, newVal) {
        if (self.editType === 'number') {
            self.intData.value = parseFloat(newVal);
            return;
        }
        self.intData.value = newVal;
    }
    this.onItemChanged = function(selectedItemProps) {
        self.intData.key = selectedItemProps.name;
        self.onLabelChange && self.onLabelChange(self.param, self.intData.key);
    }
}
