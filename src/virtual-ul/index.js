const moduleName = 'virtualUl'
const componentName = 'virtualUl'

function Controller($element, $compile, $scope, $timeout) {
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
    $timeout(() => {
      self.vListWrapper = createWiVirtualList()
    })
  }

  function createWiVirtualList() {
    // const containerSelector = '.virtual-ul'
    const initialVlistHeight = $element[0].offsetHeight || 120
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
    vListWrapper.vList.container.addEventListener('scroll', e => $scope.safeApply())
    return vListWrapper
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
    itemHeight: '<'
  },
})
