module.exports.TreeAlgorithmsWrapper = class TreeAlgorithmsWrapper {

  constructor(lv1Nodes, isValidNodePredicate, isCollapseChildPredicate) {
    this.lv0Node = { children: lv1Nodes, _isUncollapse: true, _lv:0 }; //fake node to use in recursive 
    this.traversedIdx = -2;
    this.isValidNodePredicate = isValidNodePredicate; // fn decide a node is valid or not
    this.isCollapseChildPredicate = isCollapseChildPredicate; // fn decide a node show child or not

    this._initLvOfLv1Node();
  }

  getCurrentShowNodeLength() {
    return this.traversedIdx + 1;
  }

  getChild(idx) {
    return this._getChildRecursive(idx, this.lv0Node);
  }

  _getChildRecursive(idx, curNode) {
    if (!this.isValidNodePredicate(curNode)) return null; //if it is not valid, stop traverse its children

    this.traversedIdx++;

    if (this.traversedIdx === idx) return curNode;
    if (!curNode.children || !curNode.children.length) return null;
    if (this.isCollapseChildPredicate(curNode)) return null;

    for (const child of curNode.children) {
      const founded = this._getChildRecursive(idx, child);
      if (founded) return founded;
    }

    return null;
  }

  _initLvOfLv1Node() {
    for(const lv1Node of this.lv0Node.children) {
      lv1Node._lv = 1;
    }
  }
}

module.exports.createNodeTreeElement = function createNodeTreeElement(idx) {
  const vTreeNode = document.createElement('wi-tree-node-virtual');

  vTreeNode.setAttribute('tree-root', `self.findChildAtIdx(${idx})`);
  vTreeNode.setAttribute('filter', 'self.filter');
  vTreeNode.setAttribute('get-children', 'self.getChildren');
  vTreeNode.setAttribute('get-label', 'self.getLabel');
  vTreeNode.setAttribute('get-icon', 'self.getIcon');
  vTreeNode.setAttribute('get-icons', 'self.getIcons');
  vTreeNode.setAttribute('icon-style', 'self.iconStyle');
  vTreeNode.setAttribute('keep-children', 'self.keepChildren');
  vTreeNode.setAttribute('on-drag-start', 'self.onDragStart');
  vTreeNode.setAttribute('on-drag-stop', 'self.onDragStop');
  vTreeNode.setAttribute('run-match', 'self.runMatch');
  vTreeNode.setAttribute('single-node', 'self.singleNode');
  vTreeNode.setAttribute('get-siblings', 'self.getSiblings');
  vTreeNode.setAttribute('on-context-menu', 'self.onContextMenu');
  vTreeNode.setAttribute('hide-unmatched', 'self.hideUnmatched');
  vTreeNode.setAttribute('uncollapsible', 'self.uncollapsible');
  vTreeNode.setAttribute('context-menu', 'self.contextMenu');
  vTreeNode.setAttribute('toggle-children-fn', 'self.toggleChildrenFn');
  vTreeNode.setAttribute('node-on-click', 'self.nodeOnClick');
  vTreeNode.setAttribute('get-selected-node', 'self.getSelectedNode');

  return vTreeNode;
}

module.exports.toArray = function (item) {
  if (Array.isArray(item)) return item
  return [item]
}