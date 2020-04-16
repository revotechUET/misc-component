import TreeController from './tree/controller';
import NodeController from './node/controller';

import './style.less';

export const name = 'wiTreeViewVirtual';

angular.module(name, [])
  .component('wiTreeNodeVirtual', {
    template: require('./node/template.html'),
    controller: NodeController,
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
      noDrag: '<',
      findLvOfNode: '<',
    },
    // require: {
    //   wiTreeViewVirtual: "^^wiTreeViewVirtual"
    // }
  })
  .component(name, {
    template: require('./tree/template.html'),
    controller: TreeController,
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
      noDrag: '<',
      autoScrollToSelectedNode: '<',
      nodeComparator: '<'
    },
    transclude: true
  });
