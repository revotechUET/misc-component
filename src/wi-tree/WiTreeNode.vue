<template>
  <div
    class="node"
    :class="{
      'not-matched': node.$meta.hidden,
      'not-show': hideUnmatched,
      'selected': selected
    }"
    :style="{'padding-left': node.$meta.ids.length * 1.5 + 'rem'}"
    @click.right.prevent
  >
    <div
      class="node-caret"
      :class="{'invisible': !expandable}"
      @click.stop="$emit('toggle-children', node)"
    >
      <i v-if="node.$meta.expanded" class="fa fa-caret-down"></i>
      <i v-if="!node.$meta.expanded" class="fa fa-caret-right"></i>
    </div>
    <div v-if="icons" class="node-icon">
      <i
        v-for="(icon, index) in icons"
        :key="index"
        v-bind="icon"
      ></i>
    </div>
    <div class="node-label" :title="label">{{label}}</div>
  </div>
</template>

<script>
export default {
  name: 'WiTreeNode',
  props: {
    node: Object,
    selected: Boolean,
    getLabel: Function,
    getIcons: Function,
    collapsed: Boolean,
    hideUnmatched: {
      type: Boolean,
      default: true,
    },
  },
  data: function () {
    return {
    }
  },
  computed: {
    icons() {
      return this.getIcons(this.node);
    },
    expandable() {
      return this.node[this.node.$meta.childrenKey] && this.node[this.node.$meta.childrenKey].length
    },
    label() {
      return this.getLabel(this.node);
    }
  }
}
</script>

<style lang="less" scoped>
.node {
  display: flex;
  align-items: center;
  padding-left: 19px;
  height: 37px;
  &:hover,
  &.selected {
    background: linear-gradient(to left, #f0f0f0, #fff);
  }
  &-caret {
    width: 1.5rem;
    margin-right: 0.5rem;
    cursor: pointer;
    text-align: center;
    color: #ccc;
    &:hover {
      color: #333;
    }
  }
  &-icon {
    margin-right: 1rem;
  }
  &-label {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
</style>