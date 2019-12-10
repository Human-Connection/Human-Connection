<template>
  <span>
    <base-icon :name="icon" />
    <ds-tag
      style="margin-top: -4px; margin-left: -12px; position: absolute;"
      color="primary"
      size="small"
      round
    >
      {{ count }}
    </ds-tag>
    <span class="counter-icon-text">
      <slot />
    </span>
  </span>
</template>
<script>
export default {
  props: {
    icon: { type: String, required: true },
    count: { type: Number, required: true },
  },
}
</script>
<style lang="scss" scoped>
.counter-icon-text {
  margin-left: $space-xx-small;
}
</style>
