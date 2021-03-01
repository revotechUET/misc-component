const componentName = 'wiAutocomplete';
const moduleName = componentName;
Controller.$inject = ['$timeout', '$scope', '$element'];
function Controller($timeout, $scope, $element) {
  let self = this;
  this.$onInit = function() {
    //self.itemList = self.itemList || ["Afghanistan","Bahamas","Cambodia"];
    //self.filterList = self.itemList;
    self.activeItemIdx = 0;
  }
  this.onChange = function(inputText, hideDropdown) {
    self.runFilter(inputText);
    self.onItemChanged && self.onItemChanged(inputText, self.params);
  }
  this.runFilter = function(string) {
    //self.showDropdown();
    if (!string) {
      self.filterList = angular.copy(self.itemList);
      return;
    }
    let output = [];
    angular.forEach(self.itemList, item => {
      let label = self.getItemLabel(item)
      if (label.toLowerCase().indexOf(string.toLowerCase()) >= 0) {
        output.push(item);
      }
    });
    self.filterList = output;
  }
  this.getItemLabel = function(item) {
    return (self.getItemName && self.getItemName(item)) || item;
  }
  this.selectFromFilterList = function(item) {
    self.inputText = self.getItemLabel(item);
    self.filterList = null;
    self.onItemChanged && self.onItemChanged(item, self.params);
  }
  this.selectPreviousItem = function() {
    let prevIdx = self.activeItemIdx - 1;
    if (prevIdx >= 0) {
      $timeout(() => {
        self.activeItemIdx = prevIdx;
        self.adjustScroll();
      })
    }
  }
  this.selectNextItem = function() {
    let nextIdx = self.activeItemIdx + 1;
    if (nextIdx < (self.filterList || {}).length) {
      $timeout(() => {
        self.activeItemIdx = nextIdx;
        self.adjustScroll();
      })
    }
  }
  this.selectActiveItem = function() {
    if (self.activeItemIdx >= 0 && self.activeItemIdx < self.filterList.length) {
      self.selectFromFilterList(self.filterList[self.activeItemIdx]);
    }
  }
  this.adjustScroll = function() {
    let selected = self.activeItemIdx;
    if (!(selected >= 0 && selected < self.filterList.length)) return;

    let liElem = $element.find("li");
    let ulElem = $element.find("ul");
    let ulPadding = ulElem.innerHeight() - ulElem.height();
    let liHeight = liElem.outerHeight();
    let scrollTop = ulElem.scrollTop();
    let viewport = scrollTop + ulElem.outerHeight();
    let liOffset = liHeight * selected;
    if (liOffset + liHeight > viewport) {
      ulElem.scrollTop(scrollTop + (liOffset + liHeight - viewport) + ulPadding);
    } else if (liOffset < scrollTop) {
      ulElem.scrollTop(scrollTop - (scrollTop - liOffset));
    }
  }
  $element.bind("keydown keypress", function (event) {
    switch (event.which) {
      case 38: //up
        self.selectPreviousItem();
        break;
      case 40: //down
        self.selectNextItem();
        break;
      case 13: // return
        if (self.isDropdownShowed && (self.filterList || {}).length) {
          event.preventDefault();
          self.selectActiveItem();
        }
        break;
    }
  });
  this.focusInput = function() {
    self.runFilter(self.inputText);
    self.showDropdown();
  }
  this.blurInput = function() {
    if (self.isDropdownPressed) {
      self.isDropdownPressed = false;
      return;
    }
    self.hideDropdown();
  }
  this.pressDropdown = function() {
    self.isDropdownPressed = true;
  }
  this.showDropdown = function() {
    self.isDropdownShowed = true;
  }
  this.hideDropdown = function() {
    self.isDropdownShowed = false;
  }
}

let app = angular.module(moduleName, []);

app.component(componentName, {
  template: require('./template.html'),
  style: require('./style.less'),
  controller: Controller,
  controllerAs: 'self',
  bindings: {
    itemList: '<',
    params: '<',
    onItemChanged: '<',
    getItemName: '<',
    inputText: '<'
  }
});

app.directive('wi-autocomplete', ['$parse', function ($parse) {
  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      source: '<'
    },
    link: function ($scope, $element, attrs) {
      const unwatch = $scope.$watch('source', (source) => {
        if (Array.isArray(source) && source.length) {
          // unwatch();
          $element.autocomplete({
            source,
            minLength: 0,
            select: function () {
              setTimeout(function () {
                $element.trigger('input');
              }, 0);
            },
          });
          $element.autocomplete('instance')._resizeMenu = function () {
            this.menu.element.css('max-height', window.innerHeight - this.element.offset().top - this.element.outerHeight());
          }
          $element.on('focus', function () {
            $(this).autocomplete('search', this.value);
          });
        }
      });
    }
  };
}]);

export const name = moduleName;
