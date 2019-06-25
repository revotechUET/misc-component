// module.exports = function controller($element, $timeout, $scope) {
//   let self = this;
//   if (!window.wiTreeCtrl) window.wiTreeCtrl = this;
//   this.$onInit = function () {
//     self.collapsed = (self.collapsed == undefined || self.collapsed === null) ? true : self.collapsed;
//     if (self.uncollapsible) self.collapsed = false;
//     self.keepChildren = (self.keepChildren === undefined || self.keepChildren === null) ? true : self.keepChildren;
//     self.getSiblings = self.getSiblings || function (n) { return [] }
//     this.iconStyle = this.iconStyle || {};
//     this.selectedIds = this.selectedIds || {};
//     this.onContextMenu = this.onContextMenu || function () {
//       console.log("default context menu");
//     };
//     $scope.$watch(() => (self.treeRoot), () => {
//       self.selectedIds = {};
//     });
//     $scope.$watch(() => (self.filter), () => {
//       for (let n of self.getChildrenWrapper(self.treeRoot)) {
//         visit(n, (node) => {
//           node._hidden = false;
//           return false;
//         }, null, 0);
//         if (!self.filter || !self.filter.length) continue;
//         visit(n, (node) => {
//           let matched = self.runMatch(node, self.filter);
//           node._hidden = !matched;
//           return self.keepChildren && matched;
//         }, (node, result) => {
//           // console.log('result', result);
//           node._hidden = !result;
//         }, 0);
//       }
//       $timeout(() => { });
//     });
//   }
//   this.collapseAll = function () {
//     if (self.uncollapsible) return;
//     $scope.$broadcast('collapsed-command', true);
//   }
//   this.expandAll = function () {
//     if (self.uncollapsible) return;
//     $scope.$broadcast('collapsed-command', false);
//   }
//   const _treeRoot = [];
//   this.getChildrenWrapper = function (node) {
//     if (Array.isArray(node)) return node;
//     _treeRoot[0] = node;
//     return _treeRoot;
//   }
//   this.deselectAllExcept = function (scopeId) {
//     $scope.$broadcast('deselect-command', $scope.$id);
//   }
//   this.selectRange = function (scopeId) {
//     let [min, max] = getExtentIds(self.selectedIds);
//     $scope.$broadcast('select-range-command', [Math.min(scopeId, min), Math.max(scopeId, max)]);
//   }
//   function getExtentIds(hash) {
//     let keys = Object.keys(hash).sort();
//     return [keys[0], keys[keys.length - 1]];
//   }
//   function visit(node, cb, cb1, depth = 0) {
//     if (!node) return false;

//     let stop = cb(node);

//     if (stop) return true;
//     let children = self.getChildren(node);
//     if (!children || !children.length) return false;
//     let result = false;
//     for (let child of children) {
//       let result1 = visit(child, cb, cb1, depth + 1);
//       result = result || result1;
//     }
//     cb1 && cb1(node, result);

//     return result;
//   }
//   this.getParent = getParent;
//   function getParent(root, node) {
//     let path = [];
//     visit(root, function (n) {
//       return n === node;
//     }, function (n, result) {
//       if (result) {
//         path.push(n);
//       }
//     });
//     console.log(path);
//     return path[0];
//   }
// }

const utils = require('../utils')

module.exports = function controller($element, $timeout, $scope, $compile) {
  const self = this;

  self.$onInit = function () {
    self.vListWrapper = createVirtualListWrapper();
    self.treeAlgorithmsWrapper = {};
    self.selectedNodes = [];
  }

  $scope.safeApply = function (fn) {
    const phase = this.$root.$$phase;
    if (phase == '$apply' || phase == '$digest') {
      if (fn && (typeof (fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };

  self.getSelectedNode = function () {
    return self.selectedNodes;
  }

  self.findChildAtIdx = function (idx) {

    //create a new tree every time find
    //to keep getCurrentShowNodeLength() consitent with the data
    const tree = new utils.TreeAlgorithmsWrapper(
      self.treeRoot,
      node => !node._hidden,
      node => !node._isUncollapse
    );

    self.treeAlgorithmsWrapper = tree;

    return tree.getChild(idx);
  }

  //pass to node
  self.toggleChildrenFn = function (node) {
    const nodeLen = self.treeAlgorithmsWrapper.getCurrentShowNodeLength;
    node._isUncollapse = !node._isUncollapse

    // update scroller height
    self.vListWrapper.setTotalRows(nodeLen);

    //update lv of node
    //lv define padding of node
    node._lv = node._lv || 0
    for (const child of node.children) {
      child._lv = node._lv + 1
    }
  }

  //pass to node
  self.nodeOnClick = function (node, $event) {
    node._selected = true;
    if (!$event.metaKey && !$event.ctrlKey && !$event.shiftKey) {
      // deselect all execpt the current node
      for (const selectedNode of self.selectedNodes) {

        //avoid double click current node, select go away
        if (selectedNode.id !== node.id) {
          selectedNode._selected = false;
        }
      }
      self.selectedNodes = [node];

    } else if (!self.selectedNodes.includes(node)) {
      self.selectedNodes.push(node)
    }
  }

  function createVirtualListWrapper() {
    const vListWrapper = new WiVirtualList({
      height: 460, // height of tree - height of search 
      width: 500, //width of tree
      itemHeight: 37,
      htmlContainerSelector: `#tree-view`, //TODO: improve in the future: pass htmlElement
      totalRows: utils.toArray(self.treeRoot).length, //initial
      generatorFn: row => {
        if (row < 0) return document.createElement('div');
        const foundedNode = utils.createNodeTreeElement(row);
        if (foundedNode) return $compile(foundedNode)($scope)[0];

        return document.createElement('div');
      }
    });

    vListWrapper.setContainerStyle({
      'border': 'none'
    });
    vListWrapper.vList.container.addEventListener('scroll', e => $scope.safeApply())
    return vListWrapper;
  }
}