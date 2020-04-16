const componentName = 'wiDropdownList';
const moduleName = componentName;
Controller.$inject = ['$timeout', '$scope'];
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
            self.onWiDropdownInit && self.onWiDropdownInit(self, self.params);
            //if(self.initML) return;
            if (!self.selectedItem && self.items && self.items.length) {
                self.selectedItem = self.items[0];
                self.onChange();
            }
        }, 100);
        // $scope.$watch(() => self.onCtrlBtnClick, (newValue, oldValue) => {
        //     console.log("run");
        //     self.onCtrlBtnClick = newValue;
        // })
        self.showDeleteButton = !self.hideDeleteButton;
    }
    this.onChange = function() {
        self.onItemChanged && self.onItemChanged((self.selectedItem || {}).properties, self.params);
    }
}

let app = angular.module(moduleName, ['ui.select', 'ngSanitize']);

app.component(componentName, {
    template: require('./template.html'),
    style: require('./style.less'),
    controller: Controller,
    controllerAs: 'self',
    bindings: {
        icon: "<",
        items: "<",
        params: "<",
        onWiDropdownInit: "<",
        onItemChanged: "<",
        currentSelect: "<",
        placeHolder: "@",
        ctrlBtnIcon: "@",
        onCtrlBtnClick: "<",
        choiceStyles: '@',
        hideDeleteButton: '<'
    }
});

export const name = moduleName;
