const componentName = 'wiDropdownList';
const moduleName = componentName;
Controller.$inject = ['$timeout', '$scope'];
function Controller($timeout, $scope) {
    let self = this;
    this.baseIndex = 0;
    let selectedIndex = -1;

    this.isShown = function(item) {
        if (!self.filter || !self.filter.length) return true;
        return self.filterRegExp.test((item.data || {}).label || item.label);
    }
    this.filterChange = function() {
        self.filterRegExp = new RegExp(self.filter);
    }
    this.$onInit = function() {
        $scope.$watchCollection(() => ([self.items, self.currentSelect]), () => {
            if (self.currentSelect && self.currentSelect.length) {
                if (self.items && self.items.length) {
                    self.selectedItem = self.items.find(item => {
                      if (item.data) return item.data.label === self.currentSelect;
                      return item.label === self.currentSelect;
                      //return (item.data|| {}).label === self.currentSelect;
                    });
                    self.onChange();
                }
            }
            else {
                if (self.items && self.items.length) {
                    self.selectedItem = self.items[0];
                    self.onChange();
                }
            }
        });
        $timeout(function() {
            self.onWiDropdownInit && self.onWiDropdownInit(self, self.params);
            //if(self.initML) return;
            if (!self.selectedItem && (!self.currentSelect || !self.currentSelect.length) && self.items && self.items.length) {
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
        //if (!self.selectedItem && self.items && self.items.length) {
        //    self.selectedItem = self.items[0];
        //}
        if (self.bareList) {
            (self.onItemChanged && self.selectedItem) && self.onItemChanged(self.selectedItem, self.params);
        }
        else {
            (self.onItemChanged && self.selectedItem) && self.onItemChanged((self.selectedItem || {}).properties, self.params);
        }
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
        hideDeleteButton: '<',
        bareList: "<"
    }
});
app.filter("itemFilter", function() {
    return function(items, match) {
        if (!items || !items.length) return [];
        return items.filter(item =>( (((item.data||{}).label || item.label) || "").includes(match.toUpperCase()) ));
    }
});

export const name = moduleName;
