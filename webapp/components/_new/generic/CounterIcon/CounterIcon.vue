<template>
  <span class="counter-icon">
    <base-icon :name="icon" />
    <span :class="counterClass">{{ cappedCount }}</span>
  </span>
</template>

<script>
export default {
  props: {
    icon: { type: String, required: true },
    count: { type: Number, required: true },
    danger: { type: Boolean, default: false },
  },
  computed: {
    cappedCount() {
      return this.count <= 99 ? this.count : '99+'
    },
    counterClass() {
      let counterClass = 'count'
      if (this.danger) counterClass += ' --danger'
      if (this.count === 0) counterClass += ' --inactive'

      return counterClass
    },
  },
}
</script>

<style lang="scss">
.counter-icon {
  position: relative;

  > .count {
    position: absolute;
    top: -4px;
    right: 0;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 16px;
    min-width: 16px;
    padding: 3px;
    border-radius: 50%;
    transform: translateX(50%);

    color:$color-neutral-100;
    background-color: $color-primary;
    font-size: 10px;
    line-height: 1;
    text-align: center;

    &.--danger {
      background-color: $color-danger;
    }

    &.--inactive {
      background-color: $color-neutral-60;
    }
  }
}
</style>
