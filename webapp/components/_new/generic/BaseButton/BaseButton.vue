<template>
  <button class="base-button">
    <base-icon v-if="icon" :name="icon" :class="iconClass" />
    <slot />
  </button>
</template>

<script>
export default {
  props: {
    icon: {
      type: String,
    },
  },
  computed: {
    iconClass() {
      return this.$slots.default == null ? '--icon-only' : ''
    }
  }
}
</script>

<style lang="scss">
.base-button {
  display: inline-flex;
  align-items: center;
  height: 36px;
  padding: 0 12px;
  color: $color-primary;
  background-color: $color-neutral-90;
  border: 1px solid $color-primary;
  border-radius: 6px;
  font-weight: $font-weight-bold;
  cursor: pointer;

  > .base-icon:not(.--icon-only) {
    margin-right: 6px;
  }
}
</style>
