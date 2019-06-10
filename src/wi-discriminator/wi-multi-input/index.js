const name = 'wiMultiInput';
const moduleName = 'wiDiscriminator';

let app = angular.module(moduleName);

app.component(name, {
    template: require('./template.html'),
    style: require('./style.less'),
    controller: Controller,
    controllerAs: name,
    require: 'ngModel',
    bindings: {
        model: '<',
        curvesList: '<',
        ngChange: '<',
        valueOnly: '<'
    }
});

function Controller() {
    let self = this;

    this.$onInit = function () {
        self.name = 'inputType' + Math.random();
        self.model = self.model || {};
        if (self.model.type == 'value') {
            self.SelectedValue = self.model.value;
        } else if (self.model.type == 'curve') {
            self.SelectedCurve = self.curvesList.find(curve => {
                return curve.name == self.model.value;
            })
        } else {
            return;
        }
    }

    this.groupFn = function (item) {
        return item.parent;
    }

    this.onValueChange = function () {
        self.model.value = self.SelectedValue;
    }

    this.onSelectCurve = function () {
        if (!self.SelectedCurve) {
            self.SelectedCurve = self.curvesList[0];
        }
        self.model.value = self.SelectedCurve.name;
    }
    this.onSelectCurveChange = function () {
        if (self.SelectedCurve) {
            self.model.value = self.SelectedCurve.name;
        }
    }
}
