const name = 'wiDropdownList';
const moduleName = name;

function Controller($timeout, $scope) {
    let self = this;
    this.baseIndex = 0;
    let selectedIndex = -1;

    this.isShown = function(item) {
        if (!self.filter || !self.filter.length) return true;
        return self.filterRegExp.test(item.data.label);
    }
    this.filterChange = function() {
        self.filterRegExp = new RegExp(self.filter);
    }
    this.$onInit = function() {
        $scope.$watchCollection(() => ([self.items, self.currentSelect]), () => {
            if (self.currentSelect && self.currentSelect.length && self.items && self.items.length) {
                self.selectedItem = self.items.find(item => item.data.label === self.currentSelect);
                self.onChange();
            }
        });
        $timeout(function() {
            self.onWiDropdownInit && self.onWiDropdownInit(self);
            //if(self.initML) return;
            if (!self.selectedItem && self.items && self.items.length) {
                self.selectedItem = self.items[0];
                self.onChange();
            }
        }, 100);
        self.showDeleteButton = !self.hideDeleteButton;
    }
    this.onChange = function() {
        self.onItemChanged && self.onItemChanged((self.selectedItem || {}).properties);
    }
}

let app = angular.module(moduleName, ['ui.select', 'ngSanitize']);

app.component(name, {
    template: require('./template.html'),
    style: require('./style.less'),
    controller: Controller,
    controllerAs: 'self',
    bindings: {
        icon: "<",
        items: "<",
        onWiDropdownInit: "<",
        onItemChanged: "<",
        currentSelect: "<",
        placeHolder: "@",
        ctrlBtnIcon: "@",
        onCtrlBtnClick: "<",
        choiceStyles: '@',
        hideDeleteButton: '<',
    }
});

exports.name = moduleName;
