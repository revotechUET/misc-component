const moduleName = 'virtualUl'
const componentName = 'virtualUl'

Controller.$inject = ['$element', '$compile', '$scope'];
function Controller($element, $compile, $scope) {
  const self = this

  $scope.safeApply = function(fn) {
    const phase = this.$root.$$phase
    if (phase == '$apply' || phase == '$digest') {
      if (fn && typeof fn === 'function') {
        fn()
      }
    } else {
      this.$apply(fn)
    }
  }

  self.$onInit = function() {
    createWiVirtualList()

    if (self.watchElements && self.watchElements.length) {
      $scope.$watchCollection(
        () => [...self.watchElements],
        () => {
          removeWiVirtualList()
          createWiVirtualList()
        }
      )
    }
  }

  function createWiVirtualList() {
    if (!self.numItems) return
    if (self.vListWrapper) return

    const initialVlistHeight =
      $element[0].offsetHeight || self.containerHeight || 120
    const itemHeight = self.itemHeight || 37
    const vListWrapper = new WiVirtualList({
      height: initialVlistHeight,
      itemHeight,
      htmlContainerElement: $element[0],
      totalRows: self.numItems,
      generatorFn: function(row) {
        if (row < 0) return document.createElement('div')

        const nodeTemplate = self.getComponentByIdx(row)
        return $compile(nodeTemplate)(self.componentScope)[0]
      },
    })
    vListWrapper.setContainerStyle({
      border: 'none',
    })
    vListWrapper.vList.container.addEventListener('scroll', e =>
      $scope.safeApply()
    )

    self.vListWrapper = vListWrapper
  }

  function removeWiVirtualList() {
    if (!self.vListWrapper || !(self.vListWrapper instanceof WiVirtualList))
      return
    self.vListWrapper.vList.container.remove()
    delete self.vListWrapper
  }
}

module.exports.name = moduleName
angular.module(moduleName, []).component(componentName, {
  template: require('./template.html'),
  controller: Controller,
  style: require('./style.less'),
  controllerAs: 'self',
  bindings: {
    getComponentByIdx: '<',
    componentScope: '<',
    numItems: '<',
    itemHeight: '<',
    watchElements: '<',
    containerHeight: '<',
  },
})
