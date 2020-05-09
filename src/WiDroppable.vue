<template>
  <div class="wi-droppable">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'WiDroppable',
  props: {
    onDrop: Function,
    onOver: Function,
    onOut: Function,
    onDeactivate: Function,
  },
  data: function () {
    return {
    }
  },
  computed: {

  }
}
</script>

<style lang="less" scoped>
.wi-droppable {
  transition: all 0.2s ease-in;
  float: left;
  margin: -2px;
  border: 2px dashed transparent;
  .drag-over {
    transition: all 0.2s ease-in;
    filter: invert(30%);
    background-color: rgba(255, 255, 255, 0.5);
  }
}
</style>