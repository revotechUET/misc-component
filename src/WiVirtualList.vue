<template>
  <div class="wi-virtual-list" @scroll="onScroll">
    <div v-if="!itemHeight && items[0]" class="pseudo-item" ref="pseudoItem">
      <slot :item="items[0]"></slot>
    </div>
    <div :style="{height: totalHeight+'px'}"></div>
    <div class="items" :style="{top: offsetBefore+'px'}">
      <slot v-for="(item, idx) in this.renderedItems" :item="item" :index="idx+startIdx"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WiVirtualList',
  props: {
    items: {
      type: Array,
      default: [],
    },
    itemHeight: Number,
  },
  data() {
    return {
      itemHeight_: this.itemHeight,
      startIdx: 0,
      endIdx: 0,
    }
  },
  computed: {
    renderedItems() {
      return this.items.slice(this.startIdx, this.endIdx);
    },
    totalHeight() {
      return this.items.length * this.itemHeight_;
    },
    offsetBefore() {
      return this.startIdx * this.itemHeight_;
    },
  },
  methods: {
    async calculate() {
      if (!isFinite(this.itemHeight)) {
        await this.$nextTick();
        this.itemHeight_ = this.$refs.pseudoItem.clientHeight;
      }
      this.onScroll();
    },
    onScroll() {
      const top = this.$el.scrollTop;
      this.startIdx = Math.floor(top / this.itemHeight_);
      this.endIdx = Math.ceil(this.$el.clientHeight / this.itemHeight_) + this.startIdx;
    },
  },
  mounted() {
    this.calculate();
    new ResizeObserver(this.onScroll).observe(this.$el);
  },
  watch: {
    item(val, oldVal) {
      this.calculate();
    },
    itemHeight(val) {
      if (isFinite(val)) {
        this.itemHeight_ = val;
      }
    }
  },
}
</script>

<style lang="less" scoped>
.wi-virtual-list {
  position: relative;
  height: 100%;
  width: 100%;
  overflow: auto;
}
.pseudo-item {
  width: 100%;
  position: absolute;
  top: -9999px;
  z-index: -1;
}
.items {
  position: absolute;
  width: 100%;
}
</style>