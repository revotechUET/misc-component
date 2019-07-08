module.exports = function treeController($scope, $compile, $element, $timeout) {
  const self = this;
  const ITEM_HEIGHT = 37;

  self.$onInit = function () {
    self.vListWrapper = createVirtualListWrapper(self.getVlistHeight());
    self.selectedNodes = [];

    $scope.$watch(() => (self.treeRoot), () => {
      self.selectedNodes = [];
      if (!self.vListWrapper) {
        self.vListWrapper = createVirtualListWrapper(self.getVlistHeight());				      
      }
      updateVList();
    });

    $scope.$watch(() => (self.getVlistHeight()), (newValue, oldValue) => {
      if (newValue !== oldValue) {
        destroyTree();
        self.vListWrapper = createVirtualListWrapper(self.getVlistHeight());
        updateVList();
      }
    })

    $scope.$watch(() => (self.filter), () => {
      for (let n of toArray(self.treeRoot)) {
        visit(n, (node) => {
          node._hidden = false;
          return false;
        }, null, 0);
        if (!self.filter || !self.filter.length) continue;
        visit(n, (node) => {
          let matched = self.runMatch(node, self.filter);
          node._hidden = !matched;
          return self.keepChildren && matched;
        }, (node, result) => {
          node._hidden = !result;
        }, 0);
      }
      updateVList();
      $timeout(() => { });
    });
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
    let foundedNode = null;
    let curNodeIdx = -1;
    for (const childNode of toArray(self.treeRoot)) {
      visit(childNode, (node) => {
        if (node._hidden) return true;

        ++curNodeIdx;
        //node._idx = curNodeIdx;
        if (curNodeIdx === idx) {
          foundedNode = node;
          return true
        }

        if (!node._expand) return true;
        return false;
      })
    }
    return foundedNode;
  }

  self.findIdxOfChild = function (node) {
    let idx = -1;
    let foundedNodeIdx = -1;
    for (const childNode of toArray(self.treeRoot)) {
      visit(childNode, (curNode) => {
        if(node._hidden) return true;
        
        ++idx;
        if(curNode === node) {
          foundedNodeIdx = idx;
          return true;
        }
        
        if(!curNode._expand) return true;
        return false;
      })
    }

    return foundedNodeIdx;
  }
  
  //self.findIdxOfChild = function(node) {
  //  let idx = -1;
  //  for (const childNode of toArray(self.treeRoot)) {
  //    let ret = visit(childNode, (curNode) => {
  //      if(!curNode) return false;
  //      if (curNode._hidden) return false;
        
  //      ++idx;
  //      if(curNode === node) return true;
  //      return false;
  //    }, () => {}, 0, true);
  //    if(ret) break;
  //  }
  //  return idx;
  //}

  self.toggleChildrenFn = function (node) {
    node._expand = !node._expand;
    updateVList();

    node._lv = node._lv || 0
    for (const child of self.getChildren(node)) {
      child._lv = node._lv + 1
    }
  }

  //just for passing to node
  self.nodeOnClick = function (node, $event, nodeHtmlElement) {
    node._selected = true;
    node._htmlElement = nodeHtmlElement

    if (!$event.metaKey && !$event.ctrlKey && !$event.shiftKey) {
      // deselect all execpt the current node
          for (const selectedNode of self.selectedNodes) {

            //avoid double click current node, select go away
            if (selectedNode !== node) {
              selectedNode._selected = false;
            }
          }
          //self.selectedNodes = [node];
    //      for(let selectNode of self.selectedNodes) {
    //        selectNode._selected = false;
    //      }
          self.selectedNodes.length = 0;
    } 
    else if ($event.shiftKey) {
      const nodeIdx = self.findIdxOfChild(node);
      const indexes = [];
      for(const node of self.selectedNodes) {
        const index = self.findIdxOfChild(node);
        indexes.push(index);
      }
      
      const maxIdx = Math.max(...indexes, nodeIdx);
      const minIdx = Math.min(...indexes, nodeIdx);

      for(let i = minIdx; i <= maxIdx; ++i) {
        const selectNode = self.findChildAtIdx(i);
        self.selectedNodes.push(selectNode)
        selectNode._selected = true;
      }
    }

    if (!self.selectedNodes.includes(node)) {
      self.selectedNodes.push(node);
    }

    console.log(self.selectedNodes)

    if (self.clickFn) {
			//console.log(self.selectedNodes)
      self.clickFn($event, node, self.selectedNodes, self.treeRoot)
    }
  }

  self.createNodeTreeElement = function (idx) {
    const node = `<wi-tree-node-virtual  
              filter="self.filter"
              get-children="self.getChildren"
              get-label="self.getLabel"
              get-icon="self.getIcon"
              get-icons="self.getIcons"
              icon-style="self.iconStyle"
              keep-children="self.keepChildren"
              on-drag-start="self.onDragStart"
              on-drag-stop="self.onDragStop"
              run-match="self.runMatch"
              single-node="self.singleNode"
              get-siblings="self.getSiblings"
              on-context-menu="self.onContextMenu"
              hide-unmatched="self.hideUnmatched"
              uncollapsible="self.uncollapsible"
              context-menu="self.contextMenu" 
              toggle-children-fn="self.toggleChildrenFn"
              node-on-click="self.nodeOnClick"
              get-selected-node="self.getSelectedNode"
              create-node-tree-element="self.createNodeTreeElement"
              idx="${idx}"
              find-child-at-idx="self.findChildAtIdx"
              in-search-mode="!!self.filter"
              >
            </wi-tree-node-virtual>`

    return $compile(node)($scope)[0]
  }

  self.getVlistHeight = function () {
    const h = $element.find('.tree-view-container').height();
    return h || 100;
  }

  function createVirtualListWrapper(height) {
    const vListWrapper = new WiVirtualList({
      height: height, //initial
      itemHeight: ITEM_HEIGHT,
      htmlContainerElement: $element.find('.tree-view-container')[0],
      totalRows: toArray(self.treeRoot).length || 1, //initial
      generatorFn: row => {
        if (row < 0) return document.createElement('div');
        return self.createNodeTreeElement(row);
      }
    });
    vListWrapper.setContainerStyle({
      'border': 'none'
    });
    vListWrapper.vList.container.addEventListener('scroll', e => $scope.safeApply())
    return vListWrapper;
  }

  function destroyTree() {
    $element.find('.tree-view-container')[0].innerHTML = '';
    delete self.vListWrapper;
  }

  function updateVList() {
    let len = 0;
    for (const childNode of toArray(self.treeRoot)) {
      visit(childNode, (node) => {
        if (node._hidden) return true;

        ++len;
        if (!node._expand) return true;
        return false;
      })
    }
    // const newHeight = len * ITEM_HEIGHT;

    self.vListWrapper.setTotalRows(len);
  }

  function toArray(item) {
    if (Array.isArray(item)) return item;
    return [item];
  }

  function visit(node, cb, cb1, depth = 0, stopOnMatch = false) {
    if (!node) return false;

    let stop = cb(node);
    if (stop) return true;
    let children = self.getChildren(node);
    if (!children || !children.length) return false;
    let result = false;
    for (let child of children) {
      let result1 = visit(child, cb, cb1, depth + 1, stopOnMatch);
      result = result || result1;
      if (stopOnMatch && result) return true;
    }
    cb1 && cb1(node, result);

    return result;
  }
}
