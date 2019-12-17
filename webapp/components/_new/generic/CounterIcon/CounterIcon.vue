<template>
  <span class="counter-icon">
    <base-icon :name="icon" />
    <span class="count">{{ cappedCount }}</span>
  </span>
</template>

<script>
export default {
  props: {
    icon: { type: String, required: true },
    count: { type: Number, required: true },
  },
  computed: {
    cappedCount() {
      return this.count <= 99 ? this.count : '99+'
    }
  }
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
  }
}
</style>
