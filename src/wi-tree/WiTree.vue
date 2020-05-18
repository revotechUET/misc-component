<template>
  <div class="wi-tree">
    <wi-virtual-list :items="tree" #default="{item: node}" :item-height="37">
      <wi-tree-node
        :key="node.$meta.key"
        :node="node"
        :selected="selectedNodeKeys.includes(node.$meta.key)"
        :get-label="getLabel"
        :get-icons="getNodeIcons"
        :hide-unmatched="hideUnmatched"
        @click.native="clickNode(node, $event)"
        @dblclick.native="dblclickNode(node, $event)"
        @toggle-children="toggleChildrenFn"
        draggable
        @dragstart.native="log"
      ></wi-tree-node>
    </wi-virtual-list>
  </div>
</template>

<script>
import Vue from 'vue';
import WiVirtualList from '../WiVirtualList'
import WiTreeNode from './WiTreeNode'
function idsToKey(ids) {
  return ids.join('.');
}
function keyToIds(key) {
  return key.split('.').map(v => +v);
}
export default {
  name: 'WiTree',
  components: {
    WiVirtualList,
    WiTreeNode
  },
  props: {
    treeRoot: Array,
    keepChildren: {
      type: Boolean,
      default: true,
    },
    getNodeId: {
      type: Function,
      default(node) {
        return node.$meta && node.$meta.key;
      }
    },
    getChildren: Function,
    getChildrenKey: {
      type: Function,
      default() {
        return 'children';
      }
    },
    getLabel: Function,
    getIcon: Function,
    iconStyle: [Function, String],
    runMatch: {
      type: Function,
      default(node, filter) {
        if (!node || !node.name) return true;
        return node.name.toLowerCase().includes(filter.toLowerCase());
      }
    },
    clickFn: Function,
    dblclickFn: Function,
    onDragStart: Function,
    onDragStop: Function,
    collapsed: Boolean,
    hideUnmatched: {
      type: Boolean,
      default: true,
    },
    nodeComparator: Function,
    filter: {
      type: [Object, String],
      default: '',
    },
    noDrag: Boolean,
    // vlistHeight: Number,
    // autoScrollToSelectedNode: '',
  },
  data() {
    return {
      tree: [],
      selectedNodeKeys: [],
    }
  },
  computed: {
    inSearchMode() {
      return !!this.filter;
    },
    selectedNodes() {
      return this.selectedNodeKeys.map(k => this.tree.find(n => k === this.getNodeId(n)));
    }
  },
  methods: {
    toTreeNodes(node, idx, parent = { $meta: { ids: [] } }) {
      if (node.$meta && node.$meta.hidden) return [];
      const ids = [...parent.$meta.ids, idx];
      const key = this.getNodeId(node) || idsToKey(ids);
      const childrenKey = this.getChildrenKey(node);
      const $meta = {
        ids,
        key,
        childrenKey,
        expanded: false,
        loaded: false,
        hidden: false,
        ...node.$meta,
      }
      Object.assign(node, {
        $meta,
        [childrenKey]: node[childrenKey] || [],
      });
      const children = $meta.expanded ? node[childrenKey] || [] : [];
      let nodes = [];
      if (!$meta.hidden) {
        nodes = children.map((child, index) => this.toTreeNodes(child, index, node)).flat();
      }
      if (!$meta.hidden || nodes.length) {
        nodes.unshift(node);
      }
      return nodes;
    },
    updateTree(clean) {
      this.tree = this.treeRoot.map((item, index) => this.toTreeNodes(item, index)).flat();
    },
    doFilter() {
      this.visitArray(this.treeRoot, (node) => {
        if (!node.$meta) {
          this.$set(node, '$meta', {});
        }
        node.$meta.hidden = false;
      });
      this.visitArray(this.treeRoot,
        (node) => {
          const matched = this.runMatch(node, this.filter);
          node.$meta.hidden = !matched;
          return this.keepChildren && matched;
        }, (node, childMatched) => {
          node.$meta.hidden = !childMatched;
        }
      );
    },
    getIndex(node) {
      return this.tree.findIndex(n => this.isSameNode(n, node));
    },
    getParentKey(node, nthParent = 1) {
      const ids = node.$meta.ids;
      const parentIds = ids.slice(0, ids.length - 1 - nthParent);
      if (!parentIds.length) return '';
      return idsToKey(parentIds);
    },
    getParent(node) {
      const parentKey = this.getParentKey(node);
      if (!parentKey) return this.tree;
      return this.tree.find(n => n.$meta.key === parentKey);
    },
    isSameNode(a, b) {
      if (this.nodeComparator) {
        return this.nodeComparator(a, b)
      }
      return a.$meta.key === b.$meta.key
    },
    toggleChildrenFn(node) {
      node.$meta.expanded = !node.$meta.expanded;
      this.updateTree();
    },
    getNodeIcons(node) {
      let icons = this.getIcon(node);
      if (!Array.isArray(icons)) {
        icons = [icons]
      }
      const iconStyle = typeof this.iconStyle === 'function' ? this.iconStyle(node) : this.iconStyle;
      return icons.map(i => {
        if (typeof i === 'string') {
          return {
            class: i,
            style: this.getIconStyle(node),
          }
        }
        return i;
      })
    },
    getIconStyle(node) {
      if (typeof this.iconStyle === 'function') {
        return this.iconStyle(node);
      }
      return this.iconStyle;
    },
    clickNode(node, $event) {
      if (!$event.shiftKey && !$event.ctrlKey) {
        this.selectedNodeKeys = [this.getNodeId(node)];
      }
      else if ($event.shiftKey) {
        const nodeIdx = this.getIndex(node);
        const indexes = [];
        for (const node of this.selectedNodes) {
          const index = this.getIndex(node);
          if (!indexes.includes(index)) indexes.push(index);
        }
        const maxIdx = Math.max(...indexes, nodeIdx);
        const minIdx = Math.min(...indexes, nodeIdx);
        if (maxIdx !== -1 && minIdx !== -1) {
          for (let i = minIdx; i <= maxIdx; ++i) {
            const _node = this.tree[i];
            if (!this.selectedNodeKeys.includes(this.getNodeId(_node))) {
              this.selectedNodeKeys.push(this.getNodeId(_node));
            }
          }
        }
      }
      else if ($event.ctrlKey) {
        if (!this.selectedNodeKeys.includes(this.getNodeId(node))) {
          this.selectedNodeKeys.push(this.getNodeId(node));
        }
      }
      if (this.clickFn) {
        this.clickFn($event, node, this.selectedNodes, this.tree);
      }
    },
    dblclickNode(node) {
      this.toggleChildrenFn(node);
      this.dblclickFn && this.dblclickFn(node);
    },
    visit(node, cb, cb1, depth = 0, stopOnMatch = false) {
      if (!node) return false;
      const stop = cb(node, depth);
      if (stop) return true;
      const children = node[this.getChildrenKey(node)];
      if (!children || !children.length) return false;
      let result = false;
      for (const child of children) {
        result = this.visit(child, cb, cb1, depth + 1, stopOnMatch) || result;
        if (stopOnMatch && result) return true;
      }
      cb1 && cb1(node, result);
      return result;
    },
    visitArray(nodes, cb, cb1, depth = 0, stopOnMatch = false, breakArrayOnMatch = false) {
      if (!Array.isArray(nodes)) {
        nodes = [nodes];
      }
      for (const n of nodes) {
        if (this.visit(n, cb, cb1, depth, stopOnMatch) && breakArrayOnMatch) return;
      }
    },
    log(...args) {
      console.log(...args);
    }
  },
  created() {
  },
  watch: {
    treeRoot() {
      this.doFilter();
      this.updateTree();
    },
    filter() {
      this.doFilter();
      this.updateTree();
    },
  }
}
</script>

<style lang="less" scoped>
.wi-tree {
  width: 100%;
  height: 100%;
  overflow: auto;
  user-select: none;
}
</style>
