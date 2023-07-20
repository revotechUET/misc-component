var moduleName = 'printSettings';
require('./style.less');
var componentName = 'printSettings';
export const name = componentName;

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

function printSettingsCtrl() {
    let self = this;

    this.$onInit = function () {
    }

    this.imageMode = function () {
        self.plotCtrl.printMode = 'image';
        self.plotCtrl.isPageBreak = false;
    }

    this.enableCompositeLog = function () {
        self.plotCtrl.enableCompositeLog = true;
    }

    this.disableCompositeLog = function () {
        self.plotCtrl.enableCompositeLog = false;
    }
}
