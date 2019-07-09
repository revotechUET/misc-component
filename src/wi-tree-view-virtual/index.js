const componentName = 'wiTreeViewVirtual';
module.exports.name = componentName;

require('./style.less');

angular.module(componentName, [])
  .component('wiTreeNodeVirtual', {
    template: require('./node/template.html'),
    controller: require('./node/controller'),
    controllerAs: 'self',
    bindings: {
      // treeRoot: "<",
      filter: "<",
      getChildren: "<",
      getLabel: "<",
      getIcon: "<",
      getIcons: "<",
      iconStyle: "<",
      keepChildren: "<",
      runMatch: "<",
      onDragStart: "<",
      onDragStop: "<",
      collapsed: "<",
      uncollapsible: "<",
      singleNode: "<",
      getSiblings: "<",
      onContextMenu: '<',
      contextMenu: '<',
      hideUnmatched: '<',

      //diff from origin
      toggleChildrenFn: '<',
      nodeOnClick: '<',
      getSelectedNode: '<',
      createNodeTreeElement: '<',
      idx: '<',
      findChildAtIdx:'<',
      inSearchMode: '<',
      noDrag: '<'
    },
    // require: {
    //   wiTreeViewVirtual: "^^wiTreeViewVirtual"
    // }
  })
  .component(componentName, {
    template: require('./tree/template.html'),
    controller: require('./tree/controller'),
    controllerAs: 'self',
    bindings: {
      treeRoot: "<",
      filter: "<",
      keepChildren: "<",
      getChildren: "<",
      getLabel: "<",
      getIcon: "<",
      getIcons: "<",
      iconStyle: "<",
      runMatch: "<",
      clickFn: "<",
      onDragStart: "<",
      onDragStop: "<",
      selectedIds: "<",
      collapsed: "<",
      uncollapsible: "<",
      singleNode: "<",
      getSiblings: "<",
      onContextMenu: '<',
      contextMenu: "<",
      hideUnmatched: '<',
      hideSearch: "<",
      vlistHeight: '<',
      noDrag: '<'
    },
    transclude: true
  });
