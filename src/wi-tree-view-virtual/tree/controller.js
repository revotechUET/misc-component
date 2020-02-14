module.exports = function treeController($scope, $compile, $element, $timeout) {
  const self = this;
  const ITEM_HEIGHT = 37;
  const DEFAULT_VLIST_HEIGHT = 120;

  self.$onInit = function () {
    self.vListWrapper = createVirtualListWrapper(self.getVlistHeight());
    self.selectedNodes = [];
    self.selectedNodeHtmls = [];

    self.resizeSensor1 = new ResizeSensor($element[0].parentNode, () => {
      $timeout(() => {
        destroyTree();
        self.vListWrapper = createVirtualListWrapper(self.getVlistHeight());
        updateVList();
      })
    });

    self.resizeSensor = new ResizeSensor($element.find('.tree-view-container')[0], () => {
      $timeout(() => {
        destroyTree();
        self.vListWrapper = createVirtualListWrapper(self.getVlistHeight());
        updateVList();
      })
    })
    
    if(!self.keepChildren) self.keepChildren = true;
  
    if (!self.collapsed) {
      self.expandAllChild()
    }

    if (self.autoScrollToSelectedNode) {
      self.scrollToSelectedNode();
    }

    $scope.$watchCollection(() => ([self.treeRoot, (self.treeRoot || {}).length]), () => {
      self.selectedNodes = [];
      if (!self.vListWrapper) {
        self.vListWrapper = createVirtualListWrapper(self.getVlistHeight());
      }
      updateVList();
      self.scrollToSelectedNode();
    });
    // $scope.$watch(() => (self.treeRoot.length), () => {
    //   self.selectedNodes = [];
    //   if (!self.vListWrapper) {
    //     self.vListWrapper = createVirtualListWrapper(self.getVlistHeight());
    //   }
    //   updateVList();
    //   self.scrollToSelectedNode();
    // });
//    $scope.$watch(() => (self.getVlistHeight()), (newValue, oldValue) => {
//      if (newValue !== (self.vListHeight || DEFAULT_VLIST_HEIGHT)) {
//        destroyTree();
//        self.vListWrapper = createVirtualListWrapper(self.getVlistHeight());
//        updateVList();
//      }
//    })


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
    return {
      data: self.selectedNodes,
      html: self.selectedNodeHtmls
    }
  }

  //BFS
  self.findLvOfNode = function (node) {
    let lv;
    for (const n of toArray(self.treeRoot)) {
      visit(n, (curNode, depth) => {
        if (isSameNode(curNode, node)) {
          lv = depth;
          return true;
        }

        return false;
      })
    }

    return lv;
  }


  self.findChildAtIdx = function (idx) {
    let foundedNode = null;
    let curNodeIdx = -1;
    for (const childNode of toArray(self.treeRoot)) {
      visit(childNode, (node) => {
        if (node._hidden) return true;
        //node._idx = curNodeIdx;

        ++curNodeIdx;
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
        if (curNode._hidden) return true;

        ++idx;
        if (isSameNode(node, curNode)) {
          foundedNodeIdx = idx;
          return true;
        }

        if (!curNode._expand) return true;
        return false;
      })
    }

    return foundedNodeIdx;
  }

  self.expandAllChild = function () {
    for (const childNode of toArray(self.treeRoot)) {
      visit(childNode, (curNode) => {
        curNode._expand = true;
      })
    }
  }

  self.scrollToSelectedNode = function() {

    if(self._alreadyScrollOnInit) return;

    let selectedNodeIdx = -1;
    //let isScroll = false;
    let i = -1;

    for(const childNode of toArray(self.treeRoot)) {
      visit(childNode, curNode => {
        ++i;

        if (curNode._selected) {
          //isScroll = true;
          selectedNodeIdx = i;
          return true;
        }
        return false;
      })
    }

    
    if(selectedNodeIdx > 0) {
    //  $timeout(() => {      
    //    self.vListWrapper.scrollToIdx(selectedNodeIdx);
    //    self._alreadyScrollOnInit = true;
    //  })
      // const pos = parseFloat($element.find('.node-content')[0].offsetHeight) * selectedNodeIdx
      // console.log({pos, e: $element.find('.node-content')[0], h: $element.find('.node-content')[0].offsetHeight}, selectedNodeIdx)
      const borderWidth = 1;
      const pos = ITEM_HEIGHT * (selectedNodeIdx - 1);
      $timeout(()=>{
        self.vListWrapper.vList.container.scrollTo(0, pos);  
      }, 300);
    }
  }

  self.toggleChildrenFn = function (node) {
    $timeout(() => {
      node._expand = !node._expand;
      updateVList();
    })
  }

  //just for passing to node
  self.nodeOnClick = function (node, $event) {
    node._selected = true;

    if (!$event.metaKey && !$event.shiftKey && !$event.ctrlKey) {
      // deselect all execpt the current node
      for (const selectedNode of self.selectedNodes) {

        //avoid double click current node, select go away
        if (selectedNode !== node) {
          selectedNode._selected = false;
        }
      }

      self.selectedNodes.length = 0;
      //self.selectedNodeHtmls.length = 0;

      // if (!self.selectedNodes.includes(node)) {
      //   self.selectedNodes.push(node);
      //   //self.selectedNodeHtmls.push(nodeHtmlElement)
      // }

      if(!self.selectedNodes.find(i => isSameNode(i, node))) {
        self.selectedNodes.push(node)
      }
    }
    else if ($event.shiftKey) {
      const nodeIdx = self.findIdxOfChild(node);
      const indexes = [];
      for (const node of self.selectedNodes) {
        const index = self.findIdxOfChild(node);
        if(!indexes.includes(index)) indexes.push(index);
      }

      const maxIdx = Math.max(...indexes, nodeIdx);
      const minIdx = Math.min(...indexes, nodeIdx);

      if(maxIdx !== -1 && minIdx !== -1) {
        
        for (let i = minIdx; i <= maxIdx; ++i) {
          const selectNode = self.findChildAtIdx(i);
          selectNode._selected = true;

          if (!self.selectedNodes.find(n => isSameNode(n, selectNode))) {
            self.selectedNodes.push(selectNode);
          }
        }
      }
			updateVList()
      console.log({indexes, selectNodes: self.selectedNodes})
    }
    else if($event.ctrlKey) {
      if (!self.selectedNodes.includes(node)) {
        self.selectedNodes.push(node);
        //self.selectedNodeHtmls.push(nodeHtmlElement)
      }
    }

    $timeout(() => {
      self.selectedNodeHtmls.length = 0;
      const selectedNodeHtmls = $element.find('.tree-view-container .node-content.selected')
      for (const e of selectedNodeHtmls) {
        //const wrapper = self.createNodeTreeElement(-1);
        e.classList.add('selected');
        //wrapper.appendChild(e.cloneNode(true))
        self.selectedNodeHtmls.push(e.cloneNode(true));
      }
    })

    if (self.clickFn) {
      self.clickFn($event, node, 
                self.selectedNodes.map(n => ({data:n})),
                self.treeRoot)
      //console.log(node)
      //console.log(self.selectedNodes)
     // if (!window.t) window.t = []
     // else window.t.push(self.treeRoot)
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
              no-drag="self.noDrag"
              find-lv-of-node="self.findLvOfNode"
              >
            </wi-tree-node-virtual>`

    return $compile(node)($scope.$new())[0]
  }

  self.getVlistHeight = function () {
    const h = $element.find('.tree-view-container').height();
   // console.log({h:h || self.vlistHeight || DEFAULT_VLIST_HEIGHT})
    //if(self.vlistHeight && h && h < self.vlistHeight) return self.vlistHeight;
    return h || self.vlistHeight || DEFAULT_VLIST_HEIGHT;
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
    let stop = cb(node, depth);
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

  function isSameNode(a, b) {
    if(self.nodeComparator) {
      return self.nodeComparator(a, b)
    }
    
    return a === b
  }
}
